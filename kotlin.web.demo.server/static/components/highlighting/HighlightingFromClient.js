/*
 * Copyright 2000-2012 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created with IntelliJ IDEA.
 * User: Natalia.Ukhorskaya
 * Date: 3/29/12
 * Time: 1:56 PM
 * To change this template use File | Settings | File Templates.
 */

var HighlightingFromClient = (function () {

    var instance;

    function HighlightingFromClient() {

        instance = {
            getHighlighting:function (confType, programText, callback) {
                var confTypeString = Configuration.getStringFromType(confType);
                getHighlighting(confTypeString, programText, callback);
            },
            onHighlight:function (data, callback) {
            },
            onFail:function (exception) {
            }
        };

        var isLoadingHighlighting = false;

        function getHighlighting(confType, file, callback) {
            if (!isLoadingHighlighting) {
                getDataFromApplet(confType, file, callback);
            }
        }

        var isFirstTryToLoadApplet = true;

        function getDataFromApplet(confTypeString, file, callback) {
            if (document.getElementById("myapplet") == null) {
                $("div#all").after("<applet id=\"myapplet\" code=\"org.jetbrains.webdemo.MainApplet\" width=\"0\" height=\"0\" ARCHIVE=\"/static/WebDemoApplet" + APPLET_VERSION + ".jar\" style=\"display: none;\"></applet>");
            }
            try {
                var dataFromApplet;
                try {
                    dataFromApplet = $("#myapplet")[0].getHighlighting(file, confTypeString);
                } catch (e) {
                    // For Chrome: wait until user accept work with applet
                    if (e.indexOf("getHighlighting") > 0) {
                        var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
                        if (is_chrome && isFirstTryToLoadApplet) {
                            isFirstTryToLoadApplet = false;
                            setTimeout(function () {
                                getDataFromApplet(confTypeString, file, callback);
                            }, 3000);
                            return;
                        }
                        //TODO set tooltip for applet mode
                        /*$(".applet-nohighlighting").click();
                         setStatusBarError(GET_FROM_APPLET_FAILED);

                         var title = $("#appletclient").attr("title");
                         if (title.indexOf(GET_FROM_APPLET_FAILED) == -1) {
                         $("#appletclient").attr("title", title + ". " + GET_FROM_APPLET_FAILED);
                         }*/
                    } else {
                        instance.onFail(e);
                    }

                    return;
                }
                isLoadingHighlighting = false;
                var data = eval(dataFromApplet);
                if (checkDataForNull(data)) {
                    if (checkDataForException(data)) {
                        instance.onHighlight(data, callback);
                    } else {
                        instance.onFail(data);
                    }
                } else {
                    instance.onFail("Incorrect data format.");
                }
            } catch (e) {
                isLoadingHighlighting = false;
                instance.onFail(e);
            }
        }

        return instance;
    }


    return HighlightingFromClient;
})();