; (function () {
    
    /**
     * @param mockReq1Success 模拟请求1是否成功
     * @param mockReq2Success 模拟请求2是否成功
     */
    function mockTest(mockReq1Success, mockReq2Success) {
        console.log('---------------------------------------- 场景模拟 ----------------');
        var req1Deferred = reqDeferredObj(req1, 'req1Obj', function (respObj) {
            printLog('req1 response ok. '+respObj.code+'+++'+respObj.msg);
        }, function (respObj) {
            printLog('req1 response fail. '+respObj.code+'+++'+respObj.msg, true);
        }); 

        var req2Deferred = reqDeferredObj(req2, 'req2Obj', function (respObj) {
            printLog('req2 response ok. '+respObj.code+'+++'+respObj.msg);
        }, function (respObj) {
            printLog('req2 response fail. '+respObj.code+'+++'+respObj.msg, true);
        }); 

        deferReqWrapper(true, [req1Deferred, req2Deferred], function () {
            printLog('--------------- all response success.');
        }, function () {
            printLog('--------------- all response fail.', true);
        });

        function req1(reqObj, successFn, failFn) {
            printLog('=== req1: begin request...');
            setTimeout(() => {
                var callbackFn = mockReq1Success ? successFn :  failFn;
                callbackFn({
                    code: 0, 
                    msg: 'req1-ok',
                });
            }, 1000);
        }

        function req2(reqObj, successFn, failFn) {
            printLog('=== req2: begin request...');
            setTimeout(() => {
                var callbackFn = mockReq2Success ? successFn :  failFn;
                callbackFn({
                    code: 0, 
                    msg: 'req2-ok',
                });
            }, 3000);
        }
    }
    
    function getCurrentDateTime() {
        return new Date().toTimeString();
    }

    function printLog(appendixLog, isErrorLog) {
        if (isErrorLog) {
            console.error(getCurrentDateTime()+"   " + appendixLog);
        } else {
            console.log(getCurrentDateTime()+"   " + appendixLog);
        }
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
        var onSuccessWrapperFn = deferResolveCurriedFn($deferred, true, onSuccessFn);
        var onFailWrapperFn = deferResolveCurriedFn($deferred, false, onFailFn);
        reqFn(reqObj, onSuccessWrapperFn, onFailWrapperFn);
        return $deferred.promise();

        function deferResolveCurriedFn(deferred, isSuccess, callbackFn) {
            if (!_.isFunction(callbackFn)) {
                throw new Error('callbackFn must be typeof function');
            }
            return function (respObj) {
                callbackFn(respObj);
                if (isSuccess) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            }
        }
    }

    window.DeferredHttpRequestWrapper = {
        mockTest: mockTest,
    };

})();