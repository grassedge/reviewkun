declare var PropertiesService: any;
declare var SpreadsheetApp: any;
declare var HtmlService: any;
declare var UrlFetchApp: any;
declare var Logger: any;

var property      = PropertiesService.getScriptProperties()
var SLACK_API_URL = property.getProperty("SLACK_API_URL")
var spreadsheet   = SpreadsheetApp.openById(property.getProperty("spreadsheet_id"))
var sheet         = spreadsheet.getSheetByName("設定")

namespace web {
    export function doPost(e) {
        var json = e.postData.getDataAsString();
        var payload = JSON.parse(json);

        var { repoName, action, content, configs } = fromPayload(payload);

        configs.forEach(config => {
            if (!needToPost(action, content, config)) {
                return;
            }

            postToSlack(repoName, content, config)
        })

        return HtmlService.createHtmlOutput(JSON.stringify({ repoName, action, content, configs }));
    }

    // payload と spreadsheet から必要な情報を集める
    function fromPayload(payload) {
        var repoName = payload.repository.full_name;
        var repoNames = sheet.getRange("A2:A")

        var configs = [];
        for (var i = 1; i <= repoNames.getHeight(); i++) {
            var cell = repoNames.getCell(i, 1)
            if (repoName === cell.getValue()) {
                var rowIndex = cell.getRowIndex()
                var configRow = sheet.getRange(rowIndex, 1, 1, 10).getValues()[0]
                configs.push({
                    channel: configRow[1],
                    labelCondition: configRow[2],
                    botName: configRow[3] || 'reviewkun',
                    botIcon: configRow[4] || ':eyes:',
                    showBody: configRow[5],
                    message: configRow[6],
                })
            }
        }

        return {
            repoName: repoName,
            action  : payload.action,
            content: {
                label : payload.label,
                target: payload.issue || payload.pull_request,
                user  : payload.sender,
            },
            configs: configs,
        };
    }

    function postToSlack(repoName, content, config) {
        var label   = '`' + content.label.name + '`'
        var user    = content.user.login.replace(/^(.)/, "$1/");
        var title   = '<' + content.target.html_url + '|' + content.target.title + '>'
        var botName = '<' + spreadsheet.getUrl() + '|ReviewKun>'
        var message = config.message.replace(/{{assignee}}/g, (content.target.assignees[0] || {}).login);
        var text = label + ' (by ' + user + '): ' + title + ' ' + message + ' from ' + botName;

        var body    = config.showBody ? content.target.body : '';
        var color   = content.label.color;

        var res = UrlFetchApp.fetch(SLACK_API_URL, {
            method: 'post',
            payload: {
                payload: JSON.stringify({
                    username   : config.botName,
                    // text       : text,
                    icon_emoji : config.botIcon,
                    channel    : config.channel,
                    attachments: [
                        {
                            text: [ text, body ].join("\n"),
                            color: "#" + color,
                            mrkdwn_in: ["text"],
                        }
                    ],
                    link_names: 1
                }),
            }
        });
        Logger.log(res.getContent())
    }

    function needToPost(action, content, config) {
        if (action !== 'labeled') {
            return false;
        }
        if (!config) {
            return false;
        }
        if (!content.label.name.match(new RegExp(config.labelCondition || 'レビュー'))) {
            return false;
        }
        return true;
    }
}
const doPost = web.doPost;
