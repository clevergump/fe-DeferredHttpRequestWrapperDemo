; (function () {
    
    (function name(params) {
        function req1(reqObj, successFn, failFn) {
            printLog('=== req1: begin request...');
            setTimeout(() => {
                successFn({
                    code: 0, 
                    msg: 'req1-ok',
                });
            }, 2000);
        }

        function req2(reqObj, successFn, failFn) {
            printLog('=== req2: begin request...');
            setTimeout(() => {
                successFn({
                    code: 0, 
                    msg: 'req2-ok',
                });
            }, 5000);
        }

        var req1Deferred = reqDeferredObj(req1, 'req1Obj', function (respObj) {
            printLog('req1 response ok. '+respObj.code+'+++'+respObj.msg);
        }, function (respObj) {
            printLog('req1 response fail. '+respObj.code+'+++'+respObj.msg);
        }); 

        var req2Deferred = reqDeferredObj(req2, 'req2Obj', function (respObj) {
            printLog('req2 response ok. '+respObj.code+'+++'+respObj.msg);
        }, function (respObj) {
            printLog('req2 response fail. '+respObj.code+'+++'+respObj.msg);
        }); 

        deferReqWrapper(true, [req1Deferred, req2Deferred], function () {
            printLog('--------------- all resp success.');
        }, function () {
            printLog('--------------- all resp fail.');
        });


    })();
    
    function getCurrentDateTime() {
        return new Date().toTimeString();
    }

    function printLog(appendixLog) {
        console.log(getCurrentDateTime()+"   " + appendixLog);
    }
    
    /**
     *
     * @param shouldShowLoadingBar 加载时是否需要显示加载条
     * @param reqDeferredArray           Type: Array()     An array of {@link reqDeferredObj} (deferred http requests).
     * @param allDeferredReqSuccessFn    Type: Function()  A function that is called when the Deferred is resolved.
     * @param allDeferredReqFailFn       Type: Function()  A function that is called when the Deferred is rejected.
     */
    function deferReqWrapper(shouldShowLoadingBar, reqDeferredArray, allDeferredReqSuccessFn,
        allDeferredReqFailFn) {
        if (shouldShowLoadingBar) {
            showLoadingBar();
        }
        if (!reqDeferredArray || !Array.isArray(reqDeferredArray)) {
            throw new Error('reqDeferredArray must be typeof array');
        }
        var promise = $.when.apply(null, reqDeferredArray);
        promise.then(
            hideLoadingBarCurriedFn(allDeferredReqSuccessFn, true)
            , hideLoadingBarCurriedFn(allDeferredReqFailFn, true)
        );
        
        function hideLoadingBarCurriedFn(callbackFn, currentDismissLoadingBar) {
            return function () {
                _.isFunction(callbackFn) && callbackFn();
                if (shouldShowLoadingBar && currentDismissLoadingBar) {
                    dismissLoadingBar();
                }
            }
        }

        function showLoadingBar() {
            // $.blockUI();
            printLog('--------------- showLoadingBar');
        }
        
        function dismissLoadingBar() {
            // $.unblockUI();
            printLog('--------------- dismissLoadingBar');
        }
    }

    function reqDeferredObj(reqFn, reqObj, onSuccessFn, onFailFn) {
        if (!_.isFunction(reqFn)) {
            throw new Error('reqFn must be typeof function');
        }
        if (!_.isFunction(onSuccessFn)) {
            throw new Error('onSuccessFn must be typeof function');
        }
        var $deferred = $.Deferred();
        var onSuccessWrapperFn = deferResolveCurriedFn($deferred, onSuccessFn);
        var onFailWrapperFn = deferResolveCurriedFn($deferred, onFailFn);
        reqFn(reqObj, onSuccessWrapperFn, onFailWrapperFn);
        return $deferred.promise();

        function deferResolveCurriedFn(deferred, callbackFn) {
            if (!_.isFunction(callbackFn)) {
                throw new Error('callbackFn must be typeof function');
            }
            return function (respObj) {
                callbackFn(respObj);
                deferred.resolve();
            }
        }
    }

})();