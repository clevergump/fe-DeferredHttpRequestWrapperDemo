; (function () {
    /**
     * defer执行http请求的工具类
     * @type {{reqDeferredObj, deferReq}}
     */
    var DeferredReqUtil = (function () {
        /**
         * 发起多个deferred http请求, 只有当所有请求都得到成功响应后, 才会执行整体的成功回调函数 {@param allDeferredReqSuccessFn};
         * 反之, 只要有一个请求执行失败, 就不再等待其他请求的执行, 直接提前执行整体的失败回调函数 {@param allDeferredReqFailFn}.
         *
         * 注意: defer整体的成功和失败回调函数都无参数, 而每个请求函数自己的回调函数是有参数的, 所以如果只有一个http请求函数,
         * 即: {@param reqDeferredArray} 仅包含一个元素, 则建议不要使用defer整体的回调函数.
         *
         * @param shouldShowLoadingBar 加载时是否需要显示加载条
         * @param reqDeferredArray           Type: Array()     An array of {@link getDeferredReqObj} (deferred http requests).
         * @param allDeferredReqSuccessFn    Type: Function()  A function that is called when the Deferred is resolved.
         *   注意: 该回调函数无参数
         * @param allDeferredReqFailFn       Type: Function()  A function that is called when the Deferred is rejected.
         *   注意: 该回调函数无参数
         */
        function deferReq(shouldShowLoadingBar, reqDeferredArray, allDeferredReqSuccessFn,
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

        /**
         * 代表一个http请求的 Deferred 对象
         * @param reqFn       代表http请求的函数
         * @param reqObj      代表http请求的请求参数
         * @param onSuccessFn 参数是响应得到的对象
         * @param onFailFn    参数是响应得到的对象
         * @returns {*}
         */
        function getDeferredReqObj(reqFn, reqObj, onSuccessFn, onFailFn) {
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

        return {
            getDeferredReqObj: getDeferredReqObj,
            deferReq: deferReq,
        };
    })();



    /**
     * @param mockReq1Success 模拟请求1是否成功
     * @param mockReq2Success 模拟请求2是否成功
     */
    function mockTest(mockReq1Success, mockReq2Success) {
        console.log('---------------------------------------- 场景模拟 ----------------');
        var req1Deferred = DeferredReqUtil.getDeferredReqObj(req1, 'req1Obj', function (respObj) {
            printLog('req1 response ok. '+respObj.code+'+++'+respObj.msg);
        }, function (respObj) {
            printLog('req1 response fail. '+respObj.code+'+++'+respObj.msg, true);
        }); 

        var req2Deferred = DeferredReqUtil.getDeferredReqObj(req2, 'req2Obj', function (respObj) {
            printLog('req2 response ok. '+respObj.code+'+++'+respObj.msg);
        }, function (respObj) {
            printLog('req2 response fail. '+respObj.code+'+++'+respObj.msg, true);
        }); 

        DeferredReqUtil.deferReq(true, [req1Deferred, req2Deferred], function () {
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

    window.DeferredHttpRequestWrapper = {
        mockTest: mockTest,
    };

})();