function test() {
    var payloadString = JSON.stringify(testPayload)
    Logger.log(
        doPost({
            postData: {
                getDataAsString: function() { return payloadString }
            }
        })
    )
    /*
      var params = fromPayload(payloadString)
      Logger.log(params)
      Logger.log(needToPost(params))
    */
}
