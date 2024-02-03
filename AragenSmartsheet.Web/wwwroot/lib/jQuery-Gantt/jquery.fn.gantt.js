// jQuery Gantt Chart
//=====================================START====================================================
//*******FLAG*********
var dataPanelSucess = false;
var baseForm = false;
var HideForm = false;
var Circular = false;
//********VARRIABLE DECLARTIONS*******
var heightCal = "";
var CurrentData = "";
var CurrentDatas = "";
var checkEntry = "";
var txtlasdate = "";
var daysPush = "";
var PredicDays = "";
var heightDub = "";
var BottomLow = "";
var dayget = "";
var newBottom = "";
var txtlasdates = "";
var getLeastDay = "";
var marginData = "";
var dpval = "";
var InitialVal = "";
var returnData = "";
var basdays = "";
var LowStartDate = "";
var MaxEndDate = "";
var HypridParentId = "";
var lowDateBind = "";
var MaxDateBind = "";
var SDdate = "";
var EDdate = "";
var LastEndDay = "";
var cdcount = "";
//********ARRAY DECLARTIONS**************
var CurrentDataId = [];
var storeParent = [];
var DayBaseline = [];
//*********COUNT DECALRTIONS************
var Count = 0;
let Bottom = 0;
var newCount = 0;
var nextCount = 0;
var ZCount = 0;
var YCount = 0;
var subCount = 0;
var mainCount = 0;
var VarianceCount = 0;
var healthCount = 0;
var hCount = 0;
var TaskCount = 0;
var arrayCount = [];
var ReCount = 0;
var Pshort = 0;
var hidenFlag = false;
var Pmax = 0;
var XSumBase = 0;
var MSumBase = 0;
var SSumBase = 0;
var MasterDuration = 0;
(function ($) {
    "use strict";
    $.fn.gantt = function (options) {
        console.log(options);
        var cookieKey = "jquery.fn.gantt";
        var scales = ["hours", "days", "weeks", "months"];
        //Default settings
        var settings = {
            source: null,
            itemsPerPage: 7,
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            dow: ["S", "M", "T", "W", "T", "F", "S"],
            startPos: new Date(),
            navigate: "buttons",
            scale: "days",
            useCookie: false,
            maxScale: "months",
            minScale: "hours",
            waitText: "Please wait...",
            onItemClick: function (data) { return; },
            onAddClick: function (data) { return; },
            onRender: function () { return; },
            scrollToToday: true,
            count: 0,
        };

        // custom selector `:findday` used to match on specified day in ms.
        //
        // The selector is passed a date in ms and elements are added to the
        // selection filter if the element date matches, as determined by the
        // id attribute containing a parsable date in ms.
        $.extend($.expr[":"], {
            findday: function (a, i, m) {
                var cd = new Date(parseInt(m[3], 10));
                var id = $(a).attr("id");
                id = id ? id : "";
                var si = id.indexOf("-") + 1;
                var ed = new Date(parseInt(id.substring(si, id.length), 10));
                cd = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate());
                ed = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
                return cd.getTime() === ed.getTime();
            }
        });
        // custom selector `:findweek` used to match on specified week in ms.
        $.extend($.expr[":"], {
            findweek: function (a, i, m) {
                var cd = new Date(parseInt(m[3], 10));
                var id = $(a).attr("id");
                id = id ? id : "";
                var si = id.indexOf("-") + 1;
                cd = cd.getFullYear() + "-" + cd.getDayForWeek().getWeekOfYear();
                var ed = id.substring(si, id.length);
                return cd === ed;
            }
        });
        // custom selector `:findmonth` used to match on specified month in ms.
        $.extend($.expr[":"], {
            findmonth: function (a, i, m) {
                var cd = new Date(parseInt(m[3], 10));
                cd = cd.getFullYear() + "-" + cd.getMonth();
                var id = $(a).attr("id");
                id = id ? id : "";
                var si = id.indexOf("-") + 1;
                var ed = id.substring(si, id.length);
                return cd === ed;
            }
        });



        // Date prototype helpers
        // ======================

        // `getWeekId` returns a string in the form of 'dh-YYYY-WW', where WW is
        // the week # for the year.
        // It is used to add an id to the week divs
        Date.prototype.getWeekId = function () {
            var y = this.getFullYear();
            var w = this.getDayForWeek().getWeekOfYear();
            var m = this.getMonth();
            if (m === 11 && w === 1) {
                y++;
            }
            return 'dh-' + y + "-" + w;
        };

        // `getRepDate` returns the seconds since the epoch for a given date
        // depending on the active scale
        Date.prototype.genRepDate = function () {
            switch (settings.scale) {
                case "hours":
                    return this.getTime();
                case "weeks":
                    return this.getDayForWeek().getTime();
                case "months":
                    return new Date(this.getFullYear(), this.getMonth(), 1).getTime();
                default:
                    return this.getTime();
            }
        };

        // `getDayOfYear` returns the day number for the year
        Date.prototype.getDayOfYear = function () {
            var fd = new Date(this.getFullYear(), 0, 0);
            var sd = new Date(this.getFullYear(), this.getMonth(), this.getDate());
            return Math.ceil((sd - fd) / 86400000);
        };

        // `getWeekOfYear` returns the week number for the year
        Date.prototype.getWeekOfYear = function () {
            var ys = new Date(this.getFullYear(), 0, 1);
            var sd = new Date(this.getFullYear(), this.getMonth(), this.getDate());
            if (ys.getDay() > 3) {
                ys = new Date(sd.getFullYear(), 0, (7 - ys.getDay()));
            }
            var daysCount = sd.getDayOfYear() - ys.getDayOfYear();
            return Math.ceil(daysCount / 7);

        };

        // `getDaysInMonth` returns the number of days in a month
        Date.prototype.getDaysInMonth = function () {
            return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
        };

        // `hasWeek` returns `true` if the date resides on a week boundary
        // **????????????????? Don't know if this is true**
        Date.prototype.hasWeek = function () {
            var df = new Date(this.valueOf());
            df.setDate(df.getDate() - df.getDay());
            var dt = new Date(this.valueOf());
            dt.setDate(dt.getDate() + (6 - dt.getDay()));

            if (df.getMonth() === dt.getMonth()) {
                return true;
            } else {
                return (df.getMonth() === this.getMonth() && dt.getDate() < 4) || (df.getMonth() !== this.getMonth() && dt.getDate() >= 4);
            }
        };

        // `getDayForWeek` returns the Date object for the starting date of
        // the week # for the year
        Date.prototype.getDayForWeek = function () {
            var df = new Date(this.valueOf());
            df.setDate(df.getDate() - df.getDay());
            var dt = new Date(this.valueOf());
            dt.setDate(dt.getDate() + (6 - dt.getDay()));
            if ((df.getMonth() === dt.getMonth()) || (df.getMonth() !== dt.getMonth() && dt.getDate() >= 4)) {
                return new Date(dt.setDate(dt.getDate() - 3));
            } else {
                return new Date(df.setDate(df.getDate() + 3));
            }
        };
        //var position = $(".rightPanel").scrollTop();
        //$(".rightPanel").scroll(function () {
        //    var scroll = $(".rightPanel").scrollTop();
        //    if (scroll > position) {
        //        console.log('scrollDown');
        //    } else {
        //        console.log('scrollUp');
        //    }
        //    $(".leftPanel").scrollTop(position = scroll);
        //});

        // Grid management
        // ===============
        // Core object is responsible for navigation and rendering
        var core = {
            // Return the element whose topmost point lies under the given point
            // Normalizes for IE
            elementFromPoint: function (x, y) {

                if ($.browser.msie) {
                    x -= $(document).scrollLeft();
                    y -= $(document).scrollTop();
                } else {
                    x -= window.pageXOffset;
                    y -= window.pageYOffset;
                }
                return document.elementFromPoint(x, y);
            },

            // **Create the chart**
            create: function (element) {


                // Initialize data with a json object or fetch via an xhr
                // request depending on `settings.source`
                if (typeof settings.source !== "string") {
                    element.data = settings.source;
                    core.init(element);
                } else {
                    $.getJSON(settings.source, function (jsData) {
                        element.data = jsData;
                        core.init(element);
                    });
                }
            },

            // **Setup the initial view**
            // Here we calculate the number of rows, pages and visible start
            // and end dates once the data is ready
            init: function (element) {
                element.rowsNum = element.data.length;
                element.pageCount = Math.ceil(element.rowsNum / settings.itemsPerPage);
                element.rowsOnLastPage = element.rowsNum - (Math.floor(element.rowsNum / settings.itemsPerPage) * settings.itemsPerPage);
                element.dateStart = tools.getMinDate(element);
                element.dateEnd = tools.getMaxDate(element);
                //$.each(element.data, function (i, entry) {
                //});
                /* core.render(element); */
                core.waitToggle(element, true, function () { core.render(element); });
            },
            // **Render the grid**
            render: function (element) {
                var content = $('<div class="fn-content"/>');
                var $leftPanel = core.leftPanel(element);
                content.append($leftPanel);
                var $rightPanel = core.rightPanel(element, $leftPanel);
                var mLeft, hPos;
                content.append($rightPanel);
                content.append(core.navigation(element));
                var $dataPanel = $rightPanel.find(".dataPanel");
                element.gantt = $('<div class="fn-gantt" />').append(content);
                $(element).html(element.gantt);
                if (dataPanelSucess == false) {
                    element.scrollNavigation.panelMargin = parseInt($dataPanel.css("margin-left").replace("px", ""), 10);
                }
                element.scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());
                element.scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());
                core.markNow(element);
                core.fillData(element, $dataPanel, $leftPanel);
                // Set a cookie to record current position in the view
                if (settings.useCookie) {
                    var sc = $.cookie(this.cookieKey + "ScrollPos");
                    if (sc) {
                        element.hPosition = sc;
                    }
                }
                // Scroll the grid to today's date
                if (settings.scrollToToday) {
                    var startPos = Math.round((settings.startPos / 1000 - element.dateStart / 1000) / 86400) - 2;
                    if ((startPos > 0 && element.hPosition !== 0)) {
                        if (element.scaleOldWidth) {
                            mLeft = ($dataPanel.width() - $rightPanel.width());
                            hPos = mLeft * element.hPosition / element.scaleOldWidth;
                            hPos = hPos > 0 ? 0 : hPos;
                            $dataPanel.css({ "margin-left": hPos + "px" });
                            element.scrollNavigation.panelMargin = hPos;
                            element.hPosition = hPos;
                            element.scaleOldWidth = null;
                        } else {
                            $dataPanel.css({ "margin-left": element.hPosition + "px" });
                            element.scrollNavigation.panelMargin = element.hPosition;
                        }
                        core.repositionLabel(element);
                    } else {
                        core.repositionLabel(element);
                    }
                    // or, scroll the grid to the left most date in the panel
                } else {
                    if ((element.hPosition !== 0)) {
                        if (element.scaleOldWidth) {
                            mLeft = ($dataPanel.width() - $rightPanel.width());
                            hPos = mLeft * element.hPosition / element.scaleOldWidth;
                            hPos = hPos > 0 ? 0 : hPos;
                            $dataPanel.css({ "margin-left": hPos + "px" });
                            element.scrollNavigation.panelMargin = hPos;
                            element.hPosition = hPos;
                            element.scaleOldWidth = null;
                        } else {
                            $dataPanel.css({ "margin-left": element.hPosition + "px" });
                            element.scrollNavigation.panelMargin = element.hPosition;
                        }
                        core.repositionLabel(element);
                    } else {
                        core.repositionLabel(element);
                    }
                }

                $dataPanel.css({ height: $leftPanel.height() });
                core.waitToggle(element, false);
                settings.onRender();
            },

            // Create and return the left panel with labelsdataPanel
            leftPanel: function (element) {
                /* Left panel */
                /* Ismail - Rearranged col names plan start date, plan end date and then actual start date and actual end date*/
                var ganttLeftPanel = "";
                for (var i = 0; i < element.data.length; i++) {
                    if (element.data[i].planBaseLine == true || element.data[i].planBaseLine == "True") {
                        ganttLeftPanel = $('<div class="leftPanel"/>')
                            .append($('<div class="row spacer"><div class="row header month"><div class="fn-label labelB" style="width: 50px !important;">Row</div><div class="fn-label labelB" style="width:30px !important;">Add</div><div style="width: 200px !important;" class="fn-label labelB">Task</div><div style="width: 80px !important;"  class="fn-label labelB">Work Days</div><div class="fn-label labelB" style="width: 50px !important;">Health</div><div style="width:65px  !important" class="fn-label labelB">Duration</div><div class="fn-label labelB">Plan Start Date</div><div class="fn-label labelB">Plan End Date</div><div class="fn-label labelB">Actual Start Date</div><div class="fn-label labelB" >Actual End Date</div><div class="fn-label labelB">Predecessors</div><div style="width:80px !important"  class="fn-label labelB">Variance</div><div class="fn-label labelB">Task Manager</div><div style="width:85px !important"  class="fn-label labelB">% Complete</div><div  class="fn-label labelB">Task Status</div><div  class="fn-label labelB">Delay Reason</div><div style="width:370px !important;" class="fn-label labelB">Delay Comments</div><div style="width:200px !important;" class="fn-label labelB">Latest Comments</div><div style="width:150px !important;" class="fn-label labelB">Remarks</div></div></div >')
                                .css("height", tools.getCellSize() * element.headerRows + "px")
                                .css("width", "2282px")
                                .css("padding-top", "71px"));
                        HideForm = false;
                        break;
                    }
                    else {
                        hidenFlag = true;
                        ganttLeftPanel = $('<div class="leftPanel"/>')
                            .append($('<div class="row spacer"><div class="row header month"><div class="fn-label labelB" style="width: 50px !important;">Row</div><div class="fn-label labelB" style="width:30px !important;">Add</div><div style="width: 200px !important;" class="fn-label labelB">Task</div><div style="width: 80px !important;"  class="fn-label labelB">Work Days</div><div class="fn-label labelB" style="width: 50px !important;">Health</div><div style="width:65px  !important" class="fn-label labelB">Duration</div><div class="fn-label labelB">Plan Start Date</div><div class="fn-label labelB">Plan End Date</div><div class="fn-label labelB">Predecessors</div><div style="width:80px !important"  class="fn-label labelB">Variance</div><div class="fn-label labelB">Task Manager</div><div style="width:85px !important"  class="fn-label labelB">% Complete</div><div  class="fn-label labelB">Task Status</div><div  class="fn-label labelB">Delay Reason</div><div style="width:370px !important;" class="fn-label labelB">Delay Comments</div><div style="width:200px !important;" class="fn-label labelB">Latest Comments</div><div style="width:150px !important;" class="fn-label labelB">Remarks</div></div></div >')
                                .css("height", tools.getCellSize() * element.headerRows + "px")
                                .css("width", "2054")
                                .css("padding-top", "71px"));
                        HideForm = true;
                        break;
                    }

                }


                //for (var j = 0; j < element.data.length; j++) {
                //    if (element.data[j].rowNo == 1) {
                //        if (HideForm) {
                //            if (element.data[j].planedStartDate == "" && element.data[j].planedEndDate == "") {
                //                element.data[j].startDate = "10-08-2023";
                //                element.data[j].endDate = "11-08-2023";
                //                break;
                //            }
                //        } else {
                //            if (element.data[j].startDate == "" && element.data[j].endDate == "") {
                //                element.data[j].planedStartDate = "10-08-2023";
                //                element.data[j].planedEndDate = "11-08-2023";
                //                break;
                //            }
                //        }

                //    }
                //}

                var entries = [];
                $.each(element.data, function (i, entry) {
                    settings.count++;
                    entry.rowCount = settings.count;
                    if (entry.health == "")
                        entry.health = "red";

                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        entries.push('<tr style="display: inline-flex;"><td style="width:50px !important;" class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                        entries.push('<span style="width:50px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">' + entry.rowCount + '</span>');

                        entries.push('</td>');
                        entries.push('<td style="width:30px !important ;justify-content: center;" class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                        entries.push('<i onclick=AddSubTask(' + entry.id + ') class="fa-solid fa-square-plus"></i>');
                        entries.push('</td>');
                        if (entry.parentId == null) {
                            entries.push('<td style="width:200px !important;" class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                            if (entry.enable == false) {
                                entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;<i onclick=hideDetails(' + entry.rowCount + ',' + entry.id + ') class="fa-solid fa-square-minus"></i>' + entry.name + '</span>');
                            } else {
                                entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;<i onclick=hideDetails(' + entry.rowCount + ',' + entry.id + ') class="fa-solid fa-square-plus"></i>' + entry.name + '</span>');
                            }
                            entries.push('</td>');
                        }
                        else {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.name + '</span>');
                            entries.push('</td>');
                        }

                        if (entry.id != 0) {
                            if (entry.subTask.length > 0) {
                                entries.push('<td style="width: 80px !important;" class="row name row ' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:80px !important;" class="fn-label"></span>');
                                entries.push('</td>');
                            }
                            else {
                                entries.push('<td style="width:80px !important;" class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<select style="width:80px !important;" onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + entry.parentId + ',2)" class="fn-label" id="daySelect_' + entry.rowCount + '">');
                                if (entry.workingDays == 6)
                                    entries.push('<option>5</option><option selected="true">6</option><option>7</option>');
                                else if (entry.workingDays == 7)
                                    entries.push('<option>5</option><option>6</option><option selected="true">7</option>');
                                else
                                    entries.push('<option selected="true">5</option><option>6</option><option>7</option>');

                                entries.push('</select></td>');
                            }

                            entries.push('<td style="width: 50px !important;" class="row name row' + entry.rowCount + (entry.health ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span class="fn-label fa fa-circle' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" style="width:70px !important; color:' + entry.health + '"></span>');
                            entries.push('</td>');

                            entries.push('<td style="width:65px !important" class="row name row' + entry.rowCount + (entry.duration ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:80px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.duration + '</span>');
                            entries.push('</td>');

                            if (entry.subTask.length > 0) {
                                entries.push('<td class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:110px !important;" id="spanStDate_' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.startDate + '</span>');
                                entries.push('</td>');

                                entries.push('<td class="row name row' + entry.rowCount + (entry.endDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:110px !important;" class="fn-label" id="spanEndDate_' + entry.rowCount + '">' + entry.endDate + '</span>');
                                entries.push('</td>');

                            }
                            else {
                                entries.push('<td class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:110px !important;" id="spanStDate_' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.startDate + '</span>');
                                entries.push('</td>');

                                entries.push('<td class="row name row' + entry.rowCount + (entry.endDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:110px !important;" class="fn-label" id="spanEndDate_' + entry.rowCount + '">' + entry.endDate + '</span>');
                                entries.push('</td>');


                            }
                            if (!HideForm) {
                                entries.push('<td class="row name row' + entry.rowCount + (entry.shortStartDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.shortStartDate + '</span>');
                                entries.push('</td>');
                                entries.push('<td class="row name row' + entry.rowCount + (entry.shortEndDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span style="width:110px !important;" id="spanshortEndDate_' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.shortEndDate + '</span>');
                                entries.push('</td>');
                            }

                            entries.push('<td class="row name row' + entry.rowCount + (entry.predecessors ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.predecessors + '</span>');
                            entries.push('</td>');

                            entries.push('<td style="width:80px !important" class="row name row' + entry.rowCount + (entry.variance ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.variance + '</span>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskManager ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.taskManager + '</span>');
                            entries.push('</td>');

                            entries.push('<td style="width: 85px !important;" class="row name row' + entry.rowCount + (entry.percentComplete ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.percentComplete + '</span>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskStatus ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.taskStatus + '</span>');
                            entries.push('</td>');


                            entries.push('<td class="row name row' + entry.rowCount + (entry.delayReason ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.delayReason + '</span>');
                            entries.push('</td>');

                            entries.push('<td style="width:370px !important;" class="row name row' + entry.rowCount + (entry.delayComments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.delayComments + '</span>');
                            entries.push('</td>');
                            if (entry.latestcomments == null) {
                                entry.latestcomments = "";
                            }
                            entries.push('<td style="width:200px !important;" class="row name row' + entry.rowCount + (entry.latestcomments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.latestcomments + '</span>');
                            entries.push('</td>');
                            if (entry.remarks == null) {
                                entry.remarks = "";
                            }
                            entries.push('<td style="width:150px !important;" class="row name row' + entry.rowCount + (entry.remarks ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.remarks + '</span>');
                            entries.push('</td>');

                            storeParent = entry.subTask;
                            entries = core.subtaskCreation(entry, entries, entry.id);
                        }

                        else {

                            entries.push('<td class="row name row ' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span class="fn-label"></span>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.health ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.health + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.duration ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.duration + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label datepicker" type="text" value="' + entry.startDate + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.endDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label datepicker" type="text" value="' + entry.endDate + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.shortStartDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.shortStartDate + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.shortEndDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.shortEndDate + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.predecessors ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.predecessors + '"/>');
                            entries.push('</td>');

                            entries.push('<td style="width:80px !important" class="row name row' + entry.rowCount + (entry.variance ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.variance + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskManager ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.taskManager + '"/>');
                            entries.push('</td>');


                            entries.push('<td style="width: 85px !important;" class="row name row' + entry.rowCount + (entry.percentComplete ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.percentComplete + '"/>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskStatus ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.taskStatus + '"/>');
                            entries.push('</td>');


                            entries.push('<td class="row name row' + entry.rowCount + (entry.delayReason ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input class="fn-label" type="text" value="' + entry.delayReason + '"/>');
                            entries.push('</td>');

                            entries.push('<td style="width:370px !important;" class="row name row' + entry.rowCount + (entry.delayComments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input style="width:370px !important;" class="fn-label" type="text" value="' + entry.delayComments + '"/>');
                            entries.push('</td>');
                            if (entry.latestcomments == null) {
                                entry.latestcomments = "";
                            }
                            entries.push('<td style="width:200px !important;" class="row name row' + entry.rowCount + (entry.latestcomments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input style="width:110px !important;" class="fn-label" type="text" value="' + entry.latestcomments + '"/>');
                            entries.push('</td>');
                            if (entry.remarks == null) {
                                entry.remarks = "";
                            }
                            entries.push('<td style="width:150px !important;" class="row name row' + entry.rowCount + (entry.remarks ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input style="width:110px !important;" class="fn-label" type="text" value="' + entry.remarks + '"/>');
                            entries.push('</td>');


                        }

                    }

                });
                ganttLeftPanel.append(entries.join(""));
                return ganttLeftPanel;
            },
            subtaskCreation: function (subentry, entries, pId) {


                $.each(subentry.subTask, function (i, entry) {


                    settings.count++;
                    entry.rowCount = settings.count;
                    var ParentCheck = storeParent.findIndex(x => x.parentId == entry.id);
                    if (entry.id == 0)
                        entry.flag = true;
                    if (entry.flag == true) {
                        entries.push('<tr style="display: inline-flex;"><td style="width:50px !important;" class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                        entries.push('<span style="width:50px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">' + entry.rowCount + '</span>');

                        entries.push('</td>');
                        entries.push('<td style="width:30px !important ;justify-content: center;" class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                        if (pId == entry.parentId) {
                            entries.push('<i onclick=AddSubTask(' + entry.id + ') class="fa-solid fa-square-plus"></i>');

                        } else {
                            entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;</span>');
                        }
                        entries.push('</td>');

                        entries.push('<td style="width:200px !important;" class="row name row' + entry.rowCount + (entry.desc ? '' : ' fn-wide ') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                        if (storeParent.findIndex(x => x.parentId == entry.parentId) >= 0) {

                            if (entry.id == 0) {
                                var BaseFlag = false;
                                entries.push('&emsp;&emsp;<i onclick=RemoveSubTask(' + entry.parentId + ',' + entry.rowCount + ') class="fa-solid fa-square-minus" ></i> <i onclick=AddSubTask(' + entry.id + ') class="fa-solid fa-square-plus"></i><input type="text" name="ssd" id="projectName_' + entry.rowCount + '" Value="' + entry.name + '" onchange="BindDataOnChange(' + entry.rowCount + ',' + entry.parentId + ',' + entry.id + ',1,' + BaseFlag + ',3)"   class="col - lg - 8 form - control' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' "/>');

                            }
                            else {
                                if (entry.subTask.length > 0) {
                                    if (entry.enable == false) {
                                        entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;<i onclick=displayOnchange(' + entry.id + ',' + entry.rowCount + ') class="fa-solid fa-square-minus"></i>' + entry.name + '</span>');
                                    } else {
                                        entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;<i onclick=displayOnchange(' + entry.id + ',' + entry.rowCount + ') class="fa-solid fa-square-plus"></i>' + entry.name + '</span>');
                                    }
                                } else {
                                    var BaseFlag = false;
                                    entries.push('&emsp;&emsp;<i onclick=RemoveSubTask(' + entry.parentId + ',' + entry.rowCount + ') value="' + entry.name + '" class="fa-solid fa-square-minus"></i>  <i onclick=AddSubTask(' + entry.id + ') class="fa-solid fa-square-plus"></i><input id="projectName_' + entry.rowCount + '"  name="ssd" Value="' + entry.name + '"  onchange="BindDataOnChange(' + entry.rowCount + ',' + entry.parentId + ',' + entry.id + ',1,' + BaseFlag + ',3)" class="col-lg-8 form-control' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' "/>');

                                }

                            }
                        }
                        else {
                            if (entry.subTask.length > 0) {
                                if (entry.enable == false) {
                                    entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;<i onclick=displayOnchange(' + entry.id + ',' + entry.rowCount + ') class="fa-solid fa-square-minus"></i>' + entry.name + '</span>');
                                } else {
                                    entries.push('<span style="width:200px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' ">&ensp;&ensp;<i onclick=displayOnchange(' + entry.id + ',' + entry.rowCount + ') class="fa-solid fa-square-plus"></i>' + entry.name + '</span>');
                                }
                            } else {
                                var BaseFlag = false;
                                entries.push('&emsp;&emsp;<i onclick=RemoveSubTask(' + entry.parentId + ',' + entry.rowCount + ') value="' + entry.name + '" class="fa-solid fa-square-minus"></i>  <i onclick=AddSubTask(' + entry.id + ') class="fa-solid fa-square-plus"></i><input id="projectName_' + entry.rowCount + '"  name="ssd" Value="' + entry.name + '"  onchange="BindDataOnChange(' + entry.rowCount + ',' + entry.parentId + ',' + entry.id + ',1,' + BaseFlag + ',3)" class="col-lg-8 form-control' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' "/>');

                            }
                        }
                        entries.push('</td>');

                        if (entry.subTask.length > 0) {
                            entries.push('<td style="width: 80px !important;" class="row name row ' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:80px !important;"  class="fn-label"></span>');
                            entries.push('</td>');
                        }
                        else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                                entries.push('<td style="width: 80px !important;" class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<select style="width:80px !important;" readonly="true" onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + subentry.parentId + ',2,' + baseForm + ',1)" class="fn-label" id="daySelect_' + entry.rowCount + '">');
                                if (entry.workingDays == 6)
                                    entries.push('<option>5</option><option selected="true">6</option><option>7</option>');
                                else if (entry.workingDays == 7)
                                    entries.push('<option>5</option><option>6</option><option selected="true">7</option>');
                                else
                                    entries.push('<option selected="true">5</option><option>6</option><option>7</option>');

                                entries.push('</select></td>');
                            } else {
                                baseForm = false;
                                entries.push('<td style="width: 80px !important;" class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<select style="width:80px !important;" readonly="true" onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + subentry.parentId + ',2,' + baseForm + ',1)" class="fn-label" id="daySelect_' + entry.rowCount + '">');
                                if (entry.workingDays == 6)
                                    entries.push('<option>5</option><option selected="true">6</option><option>7</option>');
                                else if (entry.workingDays == 7)
                                    entries.push('<option>5</option><option>6</option><option selected="true">7</option>');
                                else
                                    entries.push('<option selected="true">5</option><option>6</option><option>7</option>');

                                entries.push('</select></td>');
                            }
                        }
                        entries.push('<td style="width: 50px !important;" class="row name row' + entry.rowCount + (entry.health ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                        entries.push('<span class="fn-label fa fa-circle' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" style="width:70px !important; color:' + entry.health + '"></span>');
                        entries.push('</td>');
                        if (entry.subTask.length > 0) {
                            entries.push('<td style="width:65px !important" class="row name row' + entry.rowCount + (entry.duration ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                            entries.push('<span class="fn-label" id="spanduration_' + entry.rowCount + '">' + entry.duration + '</span>');
                            entries.push('</td>');
                        } else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            entries.push('<td style="width:65px !important" class="row name row' + entry.rowCount + (entry.duration ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input type="text"  style="width:85px !important"  name="ssd" id="duration_' + entry.rowCount + '" Value="' + entry.duration + '" onchange="BindDataOnChange(' + entry.rowCount + ',' + entry.parentId + ',' + entry.id + ',1,' + baseForm + ',1)"   class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' "/>');
                            entries.push('</td>');
                        }

                        if (entry.subTask.length > 0) {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            entries.push('<td class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span id="spanStDate_' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.startDate + '</span>');
                            entries.push('</td>');

                            entries.push('<td class="row name row' + entry.rowCount + (entry.endDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span class="fn-label" id="spanEndDate_' + entry.rowCount + '">' + entry.endDate + '</span>');
                            entries.push('</td>');
                        }
                        else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            if (baseForm) {

                                entries.push('<td class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                                entries.push('<input onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + pId + ',1,' + baseForm + ',2)"  maxlength="0"  type="text" id="dpStDate_' + entry.rowCount + '" class="datepicker fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" value="' + entry.startDate + '"disabled></span>');
                                entries.push('</td>');

                                entries.push('<td class="row name row' + entry.rowCount + (entry.endDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                                entries.push('<input onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + pId + ',0,' + baseForm + ',3)"  maxlength="0"  type="text" id="dpEndDate_' + entry.rowCount + '" class="datepicker fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" value="' + entry.endDate + '"disabled></span>');
                                entries.push('</td>');
                            }
                            else {

                                entries.push('<td class="row name row' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<input onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + pId + ',1,' + baseForm + ',2)"  maxlength="0" placeholder="DD-MM-YYYY" type="text" id="dpStDate_' + entry.rowCount + '" class="datepicker fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" value="' + entry.startDate + '"></span>');
                                entries.push('</td>');

                                entries.push('<td class="row name row' + entry.rowCount + (entry.endDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<input onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + pId + ',0,' + baseForm + ',3)"  maxlength="0" placeholder="DD-MM-YYYY" type="text" id="dpEndDate_' + entry.rowCount + '" class="datepicker fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" value="' + entry.endDate + '"></span>');
                                entries.push('</td>');
                            }
                        }

                        if (entry.subTask.length > 0) {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            if (baseForm) {
                                entries.push('<td class="row name row' + entry.rowCount + (entry.shortStartDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span id="spanshortStDate_' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.shortStartDate + '</span>');
                                entries.push('</td>');

                                entries.push('<td class="row name row' + entry.rowCount + (entry.shortEndDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<span class="fn-label" id="spanshortEndDate_' + entry.rowCount + '">' + entry.shortEndDate + '</span>');
                                entries.push('</td>');
                            }
                        }
                        else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            if (baseForm) {

                                entries.push('<td class="row name row' + entry.rowCount + (entry.shortStartDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<input onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + pId + ',1,' + baseForm + ',4)"  maxlength="0" placeholder="DD-MM-YYYY" type="text" id="shortStartDate_' + entry.rowCount + '" class="datepicker fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" value="' + entry.shortStartDate + '"></span>');
                                entries.push('</td>');

                                entries.push('<td class="row name row' + entry.rowCount + (entry.shortEndDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                                entries.push('<input onchange="DateCalculation(' + entry.rowCount + ',' + entry.id + ',' + entry.parentId + ',' + pId + ',0,' + baseForm + ',5)"  maxlength="0" placeholder="DD-MM-YYYY" type="text" id="shortEndDate_' + entry.rowCount + '" class="datepicker fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" value="' + entry.shortEndDate + '"></span>');
                                entries.push('</td>');
                            }

                        }

                        if (entry.subTask.length > 0) {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.predecessors ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' barWidths">' + entry.predecessors + '</span>');
                            entries.push('</td>');
                        } else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            entries.push('<td class="row name row' + entry.rowCount + (entry.predecessors ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input type="text"  style="width:85px !important"  name="ssd" id="predecessors_' + entry.rowCount + '" Value="' + entry.predecessors + '" onchange="BindDataOnChange(' + entry.rowCount + ',' + entry.parentId + ',' + entry.id + ',0,' + baseForm + ',2)"   class="col-lg-8 form-control barWidths' + (entry.cssClass ? ' ' + entry.cssClass : '') + ' "/><a id=modelHead_' + entry.rowCount + ' onclick="modelPopup(' + entry.rowCount + ')"><i class="fa fa-pencil"></i></a></span>');
                            entries.push('<a style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">');
                            entries.push('</td>');
                        }
                        entries.push('<td style="width:80px !important" class="row name row' + entry.rowCount + (entry.variance ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                        entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.variance + '</span>');
                        entries.push('</td>');

                        if (entry.subTask.length > 0) {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskManager ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '"></span>');
                            entries.push('</td>');
                        }
                        else {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskManager ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<select style="width:90px !important;" id="taskmanaager' + entry.rowCount + '" class="fn-label" onchange="taskStausOnchange(' + entry.rowCount + ',' + entry.id + ',0)" >');
                            entries.push('<option>----------</option>');
                            for (var i = 0; i < TaskManagerName.length; i++) {
                                if (entry.taskManager != "") {
                                    if (entry.taskManager == Taskey[i]) {
                                        entries.push('<option selected="true" value=' + Taskey[i] + '>' + TaskManagerName[i] + '</option>');
                                    } else {
                                        entries.push('<option  value=' + Taskey[i] + '>' + TaskManagerName[i] + '</option>');
                                    }
                                } else {
                                    entries.push('<option  value=' + Taskey[i] + '>' + TaskManagerName[i] + '</option>');
                                }
                            }
                            entries.push('</select></td>');

                        }

                        if (entry.subTask.length > 0) {
                            entries.push('<td style="width:85px !important" class="row name row' + entry.rowCount + (entry.percentComplete ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.percentComplete + '</span>');
                            entries.push('</td>');
                        }
                        else {
                            entries.push('<td style="width: 85px !important;"  class="row name row' + entry.rowCount + (entry.percentComplete ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.percentComplete + '</span>');
                            entries.push('</td>');
                        }

                        if (entry.subTask.length > 0) {
                            entries.push('<td class="row name row ' + entry.rowCount + (entry.startDate ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:80px !important;" class="fn-label"></span>');
                            entries.push('</td>');
                        }
                        else {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.taskStatus ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                            entries.push('<select style="width:90px !important;" onchange="taskStausOnchange(' + entry.rowCount + ',' + entry.id + ',2)" class="fn-label" id="taskStatus' + entry.rowCount + '">');
                            if (entry.taskStatus == "Completed")
                                entries.push('<option>Select</option><option selected="true">Completed</option><option>In Progress</option><option>Not Started</option><option>On Hold</option>');
                            else if (entry.taskStatus == "In Progress")
                                entries.push('<option>Select</option><option>Completed</option><option selected="true">In Progress</option><option>Not Started</option><option>On Hold</option>');
                            else if (entry.taskStatus == "Not Started")
                                entries.push('<option>Select</option><option>Completed</option><option>In Progress</option><option selected="true">Not Started</option><option>On Hold</option>');
                            else if (entry.taskStatus == "On HOLD" || entry.taskStatus == "On Hold")
                                entries.push('<option>Select</option><option>Completed</option><option>In Progress</option><option>Not Started</option><option selected="true">On Hold</option>');
                            else
                                entries.push('<option selected="true">Select</option><option>Completed</option><option>In Progress</option><option>Not Started</option><option>On Hold</option>');
                            entries.push('</select></td>');
                        }
                        if (entry.subTask.length > 0) {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.delayReason ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.delayReason + '</span>');
                            entries.push('</td>');
                        }
                        else {
                            entries.push('<td class="row name row' + entry.rowCount + (entry.delayReason ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                            entries.push('<select style="width:90px !important;" class="fn-label" onchange="taskStausOnchange(' + entry.rowCount + ',' + entry.id + ',3)" id="delayreson' + entry.rowCount + '">');
                            if (entry.delayReason == "Chemistry/Lab Development" || entry.delayReason == "Chemistry/Lab Developmen")
                                entries.push('<option>Select</option><option selected="true">Chemistry/Lab Development</option><option>Customer Approval</option><option>Documentation</option><option>Facility Availability</option><option>Manufacturing</option><option>Raw Material</option><option>Scope Changed</option>');
                            else if (entry.delayReason == "Customer Approval")
                                entries.push('<option>Select</option><option>Chemistry/Lab Development</option><option selected="true">Customer Approval</option><option>Documentation</option><option>Facility Availability</option><option>Manufacturing</option><option>Raw Material</option><option>Scope Changed</option>');
                            else if (entry.delayReason == "Documentation")
                                entries.push('<option>Select</option><option>Chemistry/Lab Development</option><option>Customer Approval</option><option selected="true">Documentation</option><option>Facility Availability</option><option>Manufacturing</option><option>Raw Material</option><option>Scope Changed</option>');
                            else if (entry.delayReason == "Facility Availability")
                                entries.push('<option>Select</option><option>Chemistry/Lab Development</option><option>Customer Approval</option><option>Documentation</option><option selected="true">Facility Availability</option><option>Manufacturing</option><option>Raw Material</option><option>Scope Changed</option>');
                            else if (entry.delayReason == "Manufacturing")
                                entries.push('<option>Select</option><option>Chemistry/Lab Development</option><option>Customer Approval</option><option>Documentation</option><option>Facility Availability</option><option selected="true">Manufacturing</option><option>Raw Material</option><option>Scope Changed</option>');
                            else if (entry.delayReason == "Raw Material")
                                entries.push('<option>Select</option><option>Chemistry/Lab Development</option><option>Customer Approval</option><option>Documentation</option><option>Facility Availability</option><option>Manufacturing</option><option selected="true">Raw Material</option><option>Scope Changed</option>');
                            else if (entry.delayReason == "Scope Changed")
                                entries.push('<option>Select</option><option>Chemistry/Lab Development</option><option>Customer Approval</option><option>Documentation</option><option>Facility Availability</option><option>Manufacturing</option><option>Raw Material</option><option selected="true">Scope Changed</option>');
                            else
                                entries.push('<option selected="true">Select</option><option>Chemistry/Lab Development</option><option>Customer Approval</option><option>Documentation</option><option>Facility Availability</option><option>Manufacturing</option><option>Raw Material</option><option>Scope Changed</option>');
                            entries.push('</select></td>');
                        }

                        if (entry.subTask.length > 0) {
                            entries.push('<td style="width:370px !important;"class="row name row' + entry.rowCount + (entry.delayComments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.delayComments + '</span>');
                            entries.push('</td>');
                        }
                        else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            entries.push('<td style="width:370px !important;" class="row name row' + entry.rowCount + (entry.delayComments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<input type="text" style="width:370px !important;" id="delayComment' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" onchange="taskStausOnchange(' + entry.rowCount + ',' + entry.id + ',4)"  value="' + entry.delayComments + '">');
                            entries.push('</td>');
                        }
                        if (entry.subTask.length > 0) {
                            if (entry.latestcomments == null) {
                                entry.latestcomments = "";
                            }
                            entries.push('<td style="width:200px !important;"class="row name row' + entry.rowCount + (entry.latestcomments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.latestcomments + '</span>');
                            entries.push('</td>');
                        }
                        else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            if (entry.latestcomments == null) {
                                entry.latestcomments = "";
                            }
                            entries.push('<td style="width:200px !important;" class="row name row' + entry.rowCount + (entry.latestcomments ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                            entries.push('<input type="text" style="width:110px !important;" id="latestcomments' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" onchange="taskStausOnchange(' + entry.rowCount + ',' + entry.id + ',5)"  value="' + entry.latestcomments + '"disabled>');
                            entries.push('</td>');
                        }
                        if (entry.subTask.length > 0) {
                            if (entry.remarks == null) {
                                entry.remarks = "";
                            }
                            entries.push('<td style="width:150px !important;"class="row name row' + entry.rowCount + (entry.remarks ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');
                            entries.push('<span style="width:110px !important;" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.remarks + '</span>');
                            entries.push('</td>');
                        }
                        else {
                            if (hidenFlag)
                                entry.planBaseLine = false;
                            if (entry.planBaseLine == "True" || entry.planBaseLine == true || !HideForm) {
                                baseForm = true;
                            } else {
                                baseForm = false;
                            }
                            if (entry.remarks == null) {
                                entry.remarks = "";
                            }
                            entries.push('<td style="width:150px !important;" class="row name row' + entry.rowCount + (entry.remarks ? '' : ' fn-wide') + '" id="rowheader' + entry.rowCount + '" offset="' + (entry.rowCount - 1) * tools.getCellSize() + '">');

                            entries.push('<input type="text" style="width:110px !important;" id="remarks' + entry.rowCount + '" class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '" onchange="taskStausOnchange(' + entry.rowCount + ',' + entry.id + ',6)"  value="' + entry.remarks + '">');
                            entries.push('</td>');
                        }
                    }
                    entries = core.subtaskCreation(entry, entries, pId);
                });

                return entries;
            },

            // Create and return the data panel element
            dataPanel: function (element, width) {
                var dataPanel = $('<div class="dataPanel" style="width: ' + width + 'px;"/>');

                // Handle mousewheel events for scrolling the data panel
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                if (document.attachEvent) {
                    element.attachEvent("on" + mousewheelevt, function (e) { core.wheelScroll(element, e); });
                } else if (document.addEventListener) {
                    element.addEventListener(mousewheelevt, function (e) { core.wheelScroll(element, e); }, false);
                }

                // Handle click events and dispatch to registered `onAddClick`
                // function
                dataPanel.click(function (e) {

                    e.stopPropagation();
                    var corrX, corrY;
                    var leftpanel = $(element).find(".fn-gantt .leftPanel");
                    var datapanel = $(element).find(".fn-gantt .dataPanel");
                    switch (settings.scale) {
                        case "weeks":
                            corrY = tools.getCellSize() * 2;
                            break;
                        case "months":
                            corrY = tools.getCellSize();
                            break;
                        case "hours":
                            corrY = tools.getCellSize() * 4;
                            break;
                        case "days":
                            corrY = tools.getCellSize() * 3;
                            break;
                        default:
                            corrY = tools.getCellSize() * 2;
                            break;
                    }

                    /* Adjust, so get middle of elm
                    corrY -= Math.floor(tools.getCellSize() / 2);
                    */
                    0
                    // Find column where click occurred
                    var col = core.elementFromPoint(e.pageX, datapanel.offset().top + corrY);
                    // Was the label clicked directly?
                    if (col.className === "fn-label") {
                        col = $(col.parentNode);
                    } else {
                        col = $(col);
                    }

                    var dt = col.attr("repdate");
                    // Find row where click occurred
                    var row = core.elementFromPoint(leftpanel.offset().left + leftpanel.width() - 10, e.pageY);
                    // Was the lable clicked directly?
                    if (row.className.indexOf("fn-label") === 0) {
                        row = $(row.parentNode);
                    } else {
                        row = $(row);
                    }
                    var rowId = row.data().id;

                    // Dispatch user registered function with the DateTime in ms
                    // and the id if the clicked object is a row
                    settings.onAddClick(dt, rowId);
                });
                return dataPanel;
            },

            // Creates and return the right panel containing the year/week/day
            // header
            rightPanel: function (element, leftPanel) {

                var range = null;
                // Days of the week have a class of one of
                // `sn` (Saturday), `sa` (Sunday), or `wd` (Weekday)
                var dowClass = [" sn", " wd", " wd", " wd", " wd", " wd", " sa"];
                var gridDowClass = [" sn", "", "", "", "", "", " sa"];

                var yearArr = ['<div class="row"/>'];
                var daysInYear = 0;

                var monthArr = ['<div class="row"/>'];
                var daysInMonth = 0;

                var dayArr = [];

                var hoursInDay = 0;

                var dowArr = [];

                var horArr = [];


                var today = new Date();
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var holidays = settings.holidays ? settings.holidays.join() : '';

                // Setup the headings based on the chosen `settings.scale`
                if (element.dateStart != null && element.dateEnd != null) {
                    switch (settings.scale) {
                        // **Hours**
                        case "hours":
                            range = tools.parseTimeRange(element.dateStart, element.dateEnd, element.scaleStep);
                            var year = range[0].getFullYear();
                            var month = range[0].getMonth();
                            var day = range[0];
                            for (var i = 0; i < range.length; i++) {
                                var rday = range[i];
                                // Fill years
                                var rfy = rday.getFullYear();
                                if (rfy !== year) {
                                    yearArr.push(
                                        ('<div class="row header year" style="width: '
                                            + tools.getCellSize() * daysInYear
                                            + 'px;"><div class="fn-label" style="margin-left:100px;">'
                                            + year
                                            + '</div></div>'));
                                    year = rfy;
                                    daysInYear = 0;
                                }
                                daysInYear++;


                                // Fill months
                                var rm = rday.getMonth();
                                if (rm !== month) {
                                    monthArr.push(
                                        ('<div class="row header month" style="width: '
                                            + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                                            + settings.months[month]
                                            + '</div></div>'));

                                    month = rm;
                                    daysInMonth = 0;
                                }
                                daysInMonth++;


                                // Fill days & hours

                                var rgetDay = rday.getDay();
                                var getDay = day.getDay();
                                var day_class = dowClass[rgetDay];
                                var getTime = day.getTime();
                                if (holidays.indexOf((new Date(rday.getFullYear(), rday.getMonth(), rday.getDate())).getTime()) > -1) {
                                    day_class = "holiday";
                                }
                                if (rgetDay !== getDay) {

                                    var day_class2 = (today - day === 0) ? ' today' : (holidays.indexOf(getTime) > -1) ? "holiday" : dowClass[getDay];

                                    dayArr.push('<div class="row date ' + day_class2 + '" '
                                        + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                        + ' <div class="fn-label">' + day.getDate() + '</div></div>');
                                    dowArr.push('<div class="row day ' + day_class2 + '" '
                                        + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                        + ' <div class="fn-label">' + settings.dow[getDay] + '</div></div>');

                                    day = rday;
                                    hoursInDay = 0;
                                }
                                hoursInDay++;

                                horArr.push('<div class="row day '
                                    + day_class
                                    + '" id="dh-'
                                    + rday.getTime()
                                    + '"  offset="' + i * tools.getCellSize() + '"  repdate="' + rday.genRepDate() + '"> '
                                    + rday.getHours()
                                    + '</div>');
                            }


                            // Last year
                            yearArr.push(
                                '<div class="row header year" style="width: '
                                + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                                + year
                                + '</div></div>');

                            // Last month
                            monthArr.push(
                                '<div class="row header month" style="width: '
                                + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                                + settings.months[month]
                                + '</div></div>');

                            var day_class = dowClass[day.getDay()];

                            if (holidays.indexOf((new Date(day.getFullYear(), day.getMonth(), day.getDate())).getTime()) > -1) {
                                day_class = "holiday";
                            }

                            dayArr.push('<div class="row date ' + day_class + '" '
                                + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                + ' <div class="fn-label">' + day.getDate() + '</div></div>');

                            dowArr.push('<div class="row day ' + day_class + '" '
                                + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                + ' <div class="fn-label">' + settings.dow[day.getDay()] + '</div></div>');
                            var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());
                            // Append panel elements
                            dataPanel.append(yearArr.join(""));
                            dataPanel.append(monthArr.join(""));
                            dataPanel.append($('<div class="row"/>').html(dayArr.join("")));
                            dataPanel.append($('<div class="row"/>').html(dowArr.join("")));
                            dataPanel.append($('<div class="row"/>').html(horArr.join("")));
                            break;

                        // **Weeks**
                        case "weeks":
                            range = tools.parseWeeksRange(element.dateStart, element.dateEnd);
                            yearArr = ['<div class="row"/>'];
                            monthArr = ['<div class="row"/>'];
                            var year = range[0].getFullYear();
                            var month = range[0].getMonth();
                            var day = range[0];

                            for (var i = 0; i < range.length; i++) {
                                var rday = range[i];

                                // Fill years
                                if (rday.getFullYear() !== year) {
                                    yearArr.push(
                                        ('<div class="row header year" style="width: '
                                            + tools.getCellSize() * daysInYear
                                            + 'px;"><div class="fn-label">'
                                            + year
                                            + '</div></div>'));
                                    year = rday.getFullYear();
                                    daysInYear = 0;
                                }
                                daysInYear++;

                                // Fill months
                                if (rday.getMonth() !== month) {
                                    monthArr.push(
                                        ('<div class="row header month" style="width:'
                                            + tools.getCellSize() * daysInMonth
                                            + 'px;"><div class="fn-label">'
                                            + settings.months[month]
                                            + '</div></div>'));
                                    month = rday.getMonth();
                                    daysInMonth = 0;
                                }
                                daysInMonth++;

                                // Fill weeks
                                dayArr.push('<div class="row day wd" '
                                    + ' id="' + rday.getWeekId() + '" offset="' + i * tools.getCellSize() + '" repdate="' + rday.genRepDate() + '"> '
                                    + ' <div class="fn-label">' + rday.getWeekOfYear() + '</div></div>');
                            }


                            // Last year
                            yearArr.push(
                                '<div class="row header year" style="width: '
                                + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                                + year
                                + '</div></div>');

                            // Last month
                            monthArr.push(
                                '<div class="row header month" style="width: '
                                + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                                + settings.months[month]
                                + '</div></div>');

                            var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());

                            dataPanel.append(yearArr.join("") + monthArr.join("") + dayArr.join("") + (dowArr.join("")));

                            break;

                        // **Months**
                        case 'months':
                            range = tools.parseMonthsRange(element.dateStart, element.dateEnd);

                            var year = range[0].getFullYear();
                            var month = range[0].getMonth();
                            var day = range[0];

                            for (var i = 0; i < range.length; i++) {
                                var rday = range[i];

                                // Fill years
                                if (rday.getFullYear() !== year) {
                                    yearArr.push(
                                        ('<div class="row header year" style="width: '
                                            + tools.getCellSize() * daysInYear
                                            + 'px;"><div class="fn-label">'
                                            + year
                                            + '</div></div>'));
                                    year = rday.getFullYear();
                                    daysInYear = 0;
                                }
                                daysInYear++;
                                monthArr.push('<div class="row day wd" id="dh-' + tools.genId(rday.getTime()) + '" offset="' + i * tools.getCellSize() + '" repdate="' + rday.genRepDate() + '">' + (1 + rday.getMonth()) + '</div>');
                            }

                            // Last year
                            yearArr.push(
                                '<div class="row header year" style="width: '
                                + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                                + year
                                + '</div></div>');

                            // Last month
                            monthArr.push(
                                '<div class="row header month" style="width: '
                                + tools.getCellSize() * daysInMonth + 'px">"<div class="fn-label"style="margin-left:51px;">'
                                + settings.months[month]
                                + '</div></div>');

                            var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());

                            // Append panel elements
                            dataPanel.append(yearArr.join(""));
                            dataPanel.append(monthArr.join(""));
                            dataPanel.append($('<div class="row"/>').html(dayArr.join("")));
                            dataPanel.append($('<div class="row"/>').html(dowArr.join("")));

                            break;

                        // **Days (default)**
                        default:
                            range = tools.parseDateRange(element.dateStart, element.dateEnd);

                            var year = range[0].getFullYear();
                            var month = range[0].getMonth();
                            var day = range[0];

                            for (var i = 0; i < range.length; i++) {
                                var rday = range[i];

                                // Fill years
                                if (rday.getFullYear() !== year) {
                                    yearArr.push(
                                        ('<div class="row header year" style="width:'
                                            + tools.getCellSize() * daysInYear
                                            + 'px;"><div class="fn-label">'
                                            + year
                                            + '</div></div>'));
                                    year = rday.getFullYear();
                                    daysInYear = 0;
                                }
                                daysInYear++;

                                // Fill months
                                if (rday.getMonth() !== month) {
                                    monthArr.push(
                                        ('<div class="row header month" style="width:'
                                            + tools.getCellSize() * daysInMonth
                                            + 'px;"><div class="fn-label" style="margin-left:51px;">'
                                            + settings.months[month]
                                            + '</div></div>'));
                                    month = rday.getMonth();
                                    daysInMonth = 0;
                                }
                                daysInMonth++;

                                var getDay = rday.getDay();
                                var day_class = dowClass[getDay];
                                if (holidays.indexOf((new Date(rday.getFullYear(), rday.getMonth(), rday.getDate())).getTime()) > -1) {
                                    day_class = "holiday";
                                }

                                dayArr.push('<div class="row date ' + day_class + '" '
                                    + ' id="dh-' + tools.genId(rday.getTime()) + '" offset="' + i * tools.getCellSize() + '" repdate="' + rday.genRepDate() + '> '
                                    + ' <div class="fn-label">' + rday.getDate() + '</div></div>');
                                dowArr.push('<div class="row day ' + day_class + '" '
                                    + ' id="dw-' + tools.genId(rday.getTime()) + '"  repdate="' + rday.genRepDate() + '"> '
                                    + ' <div class="fn-label">' + settings.dow[getDay] + '</div></div>');

                            } //for


                            // Last year
                            yearArr.push(
                                '<div class="row header year" style="width: '
                                + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label" style="margin-left: 51px;">'
                                + year
                                + '</div></div>');

                            // Last month
                            monthArr.push(
                                '<div class="row header month" style="width: '
                                + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label" style="margin-left:51px;">'
                                + settings.months[month]
                                + '</div></div>');

                            var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());
                            // Append panel elements

                            dataPanel.append(yearArr.join(""));
                            dataPanel.append(monthArr.join(""));
                            dataPanel.append($('<div class="row"/>').html(dayArr.join("")));
                            dataPanel.append($('<div class="row"/>').html(dowArr.join("")));
                            //if (element.subTask.length > 0) {
                            //    core.rightPanel(element.subTask, leftPanel);
                            //}

                            break;
                    }
                } else {
                    dataPanelSucess = true;
                }
                return $('<div class="rightPanel"></div>').append(dataPanel);
            },

            // **Navigation**
            navigation: function (element) {
                var ganttNavigate = null;
                // Scrolling navigation is provided by setting
                // `settings.navigate='scroll'`
                if (settings.navigate === "scroll") {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<div class="nav-slider" />')
                            .append($('<div class="nav-slider-left" />')
                                .append($('<span role="button" class="nav-link nav-page-back"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        core.navigatePage(element, -1);
                                    }))
                                .append($('<div class="page-number"/>')
                                    .append($('<span/>')
                                        .html(element.pageNum + 1 + ' of ' + element.pageCount)))
                                .append($('<span role="button" class="nav-link nav-page-next"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        core.navigatePage(element, 1);
                                    }))
                                .append($('<span role="button" class="nav-link nav-now"/>')
                                    .html('&#9679;')
                                    .click(function () {
                                        core.navigateTo(element, 'now');
                                    }))
                                .append($('<span role="button" class="nav-link nav-prev-week"/>')
                                    .html('&lt;&lt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 6);
                                        }
                                    }))
                                .append($('<span role="button" class="nav-link nav-prev-day"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 3);
                                        }
                                    })))
                            .append($('<div class="nav-slider-content" />')
                                .append($('<div class="nav-slider-bar" />')
                                    .append($('<a class="nav-slider-button" />')
                                    )
                                    .mousedown(function (e) {
                                        if (e.preventDefault) {
                                            e.preventDefault();
                                        }
                                        element.scrollNavigation.scrollerMouseDown = true;

                                        core.sliderScroll(element, e);
                                    })
                                    .mousemove(function (e) {
                                        if (element.scrollNavigation.scrollerMouseDown) {
                                            core.sliderScroll(element, e);
                                        }
                                    })
                                )
                            )
                            .append($('<div class="nav-slider-right" />')
                                .append($('<span role="button" class="nav-link nav-next-day"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -3);
                                        }
                                    }))
                                .append($('<span role="button" class="nav-link nav-next-week"/>')
                                    .html('&gt;&gt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -6);
                                        }
                                    }))
                                .append($('<span role="button" class="nav-link nav-zoomIn"/>')
                                    .html('&#43;')
                                    .click(function () {
                                        core.zoomInOut(element, -1);
                                    }))
                                .append($('<span role="button" class="nav-link nav-zoomOut"/>')
                                    .html('&#45;')
                                    .click(function () {
                                        core.zoomInOut(element, 1);
                                    }))
                            )
                        );
                    $(document).mouseup(function () {
                        element.scrollNavigation.scrollerMouseDown = false;
                    });
                    // Button navigation is provided by setting `settings.navigation='buttons'`
                } else {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<span role="button" class="nav-link nav-page-back"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigatePage(element, -1);
                            }))
                        .append($('<div class="page-number"/>')
                            .append($('<span/>')
                                .html(element.pageNum + 1 + ' of ' + element.pageCount)))
                        .append($('<span role="button" class="nav-link nav-page-next"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigatePage(element, 1);
                            }))
                        .append($('<span role="button" class="nav-link nav-begin"/>')
                            .html('&#124;&lt;')
                            .click(function () {
                                core.navigateTo(element, 'begin');
                            }))
                        .append($('<span role="button" class="nav-link nav-prev-week"/>')
                            .html('&lt;&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * 7);
                            }))
                        .append($('<span role="button" class="nav-link nav-prev-day"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize());
                            }))
                        .append($('<span role="button" class="nav-link nav-now"/>')
                            .html('&#9679;')
                            .click(function () {
                                core.navigateTo(element, 'now');
                            }))
                        .append($('<span role="button" class="nav-link nav-next-day"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -1);
                            }))
                        .append($('<span role="button" class="nav-link nav-next-week"/>')
                            .html('&gt;&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -7);
                            }))
                        .append($('<span role="button" class="nav-link nav-end"/>')
                            .html('&gt;&#124;')
                            .click(function () {
                                core.navigateTo(element, 'end');
                            }))
                        .append($('<span role="button" class="nav-link nav-zoomIn"/>')
                            .html('&#43;')
                            .click(function () {
                                core.zoomInOut(element, -1);
                            }))
                        .append($('<span role="button" class="nav-link nav-zoomOut"/>')
                            .html('&#45;')
                            .click(function () {
                                core.zoomInOut(element, 1);
                            }));
                }
                return $('<div class="bottom"/>').append(ganttNavigate);
            },

            // **Progress Bar**
            // Return an element representing a progress of position within
            // the entire chart
            createProgressBar: function (days, cls, desc, label, dataObj, Predeccsors, rowCount) {

                var arrTextCount = [];
                var DaysArray = [];
                var RowArray = [];
                var cellWidth = tools.getCellSize();
                var barMarg = tools.getProgressBarMargin() || 0;
                var lineLst = "";
                var widthLine = "";
                var widthLines = "";
                var marginLeft = "";
                var txtCounts = "";
                var spanDown = "";
                //  GANTTCHART ARROW BIND STATEMENT GIVEN BELOW 
                if (Predeccsors != "" && Predeccsors != ",") {
                    var hBool = false;
                    //SPLIT PREDECSSOR VALUES
                    var splitPred = Predeccsors.split(",");
                    //prdecssors  Boolean declartion(rowcount>txtCount)
                    var IData = false;
                    var FFBoolean = false;
                    var FF_maxflag = false;
                    var Defult = false;
                    var RowFlag = false;
                    var SFBoolean = false;
                    var FS_flag = false;
                    var FF_flag = false;
                    var reverseFlag = false;
                    var OverallCount = 0;
                    //Succssors Boolean declartion(txtCount>rowcount)
                    var record = recheckData(Predeccsors);
                    var CleanFlag = false;
                    $.each(record, function (index, value) {
                        if (value.Counts != 0)
                            CleanFlag = true;
                    });

                    var SSBoolean = false;
                    for (var i = 0; i < splitPred.length; i++) {
                        var Minus = splitPred[i].indexOf('-');
                        if (Minus < 0) {
                            var spliteachpred = splitPred[i].split("+");
                        }
                        else {
                            var spliteachpred = splitPred[i].split("-");
                            reverseFlag = true;
                        }
                        if (CleanFlag)
                            reverseFlag = false;
                        if (splitPred[i] != "") {
                            for (var j = 0; j < spliteachpred.length; j++) {
                                var str1 = spliteachpred[j];
                                var str2 = "FS";
                                var StringType = "";
                                var last1 = str1.substr(-2);
                                var last2 = str1.substr(-1);
                                var txtCount = "";
                                if (str2 == last1) {
                                    StringType = "FS";
                                    hBool = true;
                                    var put = str1.split('FS');
                                    txtCount = parseInt(put);
                                }
                                str2 = "FF";
                                if (str2 == last1) {
                                    StringType = "FF";
                                    hBool = true;
                                    str1.split('FF');
                                    txtCount = parseInt(str1[0]);
                                }
                                str2 = "SS";
                                if (str2 == last1) {
                                    hBool = true;
                                    StringType = "SS";
                                    str1.split('SS');
                                    txtCount = parseInt(str1[0]);
                                }
                                str2 = "SF";
                                if (str2 == last1) {
                                    hBool = true;
                                    StringType = "SF";
                                    str1.split('SF');
                                    txtCount = parseInt(str1[0]);
                                }
                                if (last2 != "S") {
                                    if (last2 != "d") {
                                        txtCount = parseInt(str1);
                                    }
                                }

                                if (txtCount != "" && txtCount != NaN) {
                                    txtCounts = txtCount;
                                    arrTextCount.push(txtCounts);
                                    var getWid = "";
                                    //SUCCESSORS AND PREDECSSORS CONDITION CHECK
                                    if (txtCount > rowCount) {
                                        getWid = getWidthEndGantt(txtCount, rowCount, StringType, HideForm);
                                    }
                                    else {
                                        getWid = getWidthGantt(txtCount, rowCount, StringType, HideForm);
                                    }
                                    if (getWid == 0 || getWid != "") {
                                        var dateItem = Bottom;
                                        if (parseInt(getWid) < 0) {
                                            getWid = parseInt(getWid) * -1;
                                        }
                                        if (hBool) {
                                            if (StringType == "FS") {
                                                if (rowCount < txtCount) {
                                                    var Height = parseInt(txtCount) - parseInt(rowCount);
                                                    Height = parseInt(Height) < 0 ? parseInt(Height) * -1 : parseInt(Height);
                                                    Height = (parseInt(Height) * 24) - 19;
                                                    var Top = 26;
                                                    var Margin_Left = 27;
                                                    // HORIZANTAL CODE---------
                                                    var H_Width = parseInt(getWid[0].siblingData) < 0 ? parseInt(getWid[0].siblingData) * -1 : parseInt(getWid[0].siblingData);
                                                    H_Width = (parseInt(H_Width) * 24) - 14;
                                                    //var H_TOP = parseInt(Height) + 8;
                                                    var H_TOP = parseInt(txtCount) - parseInt(rowCount);
                                                    H_TOP = parseInt(H_TOP) < 0 ? parseInt(H_TOP) * -1 : parseInt(H_TOP);
                                                    H_TOP = (parseInt(H_TOP) * 24) + 7;
                                                    var H_Marginleft = parseInt(getWid[0].siblingData);
                                                    if (parseInt(getWid[0].siblingData) < 0) {
                                                        H_Marginleft = parseInt(getWid[0].siblingData) * -1;
                                                    }
                                                    H_Marginleft = (((parseInt(H_Marginleft) - 1) * 24) - 17);
                                                    if (parseInt(H_Marginleft) < 0) {
                                                        H_Marginleft = parseInt(H_Marginleft) * -1;
                                                    }
                                                    if (getWid[0].siblingData != -1)
                                                        H_Marginleft = '-' + H_Marginleft;
                                                    var Ileft = "";
                                                    if (Defult == false) {
                                                        Defult = true;
                                                        Ileft = 7;
                                                    } else {
                                                        Ileft = -8;
                                                    }
                                                    if (FF_flag == false) {
                                                        FF_flag = true;
                                                    }
                                                    if (SFBoolean == false) {
                                                        SFBoolean = true;
                                                    } if (FS_flag == false) {
                                                        FS_flag = true;
                                                    }
                                                    if (FFBoolean) {
                                                        Ileft = parseInt(getWid[0].CurrentData);
                                                        if (parseInt(Ileft) < 0)
                                                            Ileft = parseInt(Ileft) * -1;
                                                        Ileft = ((parseInt(Ileft) + 1) * 24) - 3;
                                                        Ileft = '-' + Ileft;
                                                    } else if (SSBoolean) {
                                                        Ileft = parseInt(getWid[0].CurrentData);
                                                        if (parseInt(Ileft) < 0)
                                                            Ileft = parseInt(Ileft) * -1;
                                                        Ileft = ((parseInt(Ileft) + 1) * 24) - 19;
                                                        Ileft = '-' + Ileft;
                                                    }
                                                    //Predeccsors overall check

                                                    if (!reverseFlag) {
                                                        lineLst += '<span class="fn-label-line" style="height: ' + Height + 'px !important;width: 1px;bottom:0px;top: ' + Top + 'px;margin-left: ' + Margin_Left + 'px;"></span>'
                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + H_Width + 'px;bottom:0px;top: ' + H_TOP + 'px;margin-left:' + H_Marginleft + 'px;"></span>'
                                                        if (SSBoolean)
                                                            spanDown += '<span class="fa fa-arrow-up" style="font-size: 10px;margin-left: ' + Ileft + 'px;color: black;margin-top: 0px;"></span>';
                                                        else
                                                            spanDown += '<span class="fa fa-arrow-up" style="font-size: 10px;float:left;margin-left: ' + Ileft + 'px;color: black;margin-top: 0px;"></span>';
                                                    }
                                                    else {
                                                        Height = parseInt(Height) + 6;
                                                        Top = parseInt(Top) - 5;
                                                        var C_Width = parseInt(getWid[0].siblingData) < 0 ? parseInt(getWid[0].siblingData) * -1 : parseInt(getWid[0].siblingData);
                                                        var R_Width = ((parseInt(C_Width) + 1) * 24) + 3;
                                                        //var R_Width = ((parseInt(C_Width) - 1) * 24) - 2;
                                                        var R_left = R_Width + 15;
                                                        var line_left = ((parseInt(C_Width) + 2) * 24) + 5;
                                                        if (!getWid[0].Flag) {
                                                            line_left = ((parseInt(C_Width) - 2) * 24) - 6; line_left = '-' + line_left;
                                                            Margin_Left = ((parseInt(C_Width) - 2) * 24) - 6; Margin_Left = '-' + Margin_Left;
                                                            R_left = ((parseInt(C_Width) - 2) * 24) + 5; R_left = '-' + R_left;
                                                            R_Width = ((parseInt(C_Width) - 1) * 24) - 2;
                                                        }
                                                        lineLst += '<span class="fn-label-line" style="height: ' + Height + 'px !important;width: 1px;bottom:0px;top: ' + Top + 'px;margin-left: ' + line_left + 'px;"></span>';
                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: 12px;bottom:0px;top: ' + H_TOP + 'px;margin-left: ' + R_left + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: ' + R_Width + 'px;bottom:0px;top: ' + Top + 'px;margin-left: ' + Margin_Left + 'px;"></span>';
                                                        spanDown += '<span class="fa fa-arrow-up" style="font-size: 10px;float:left;margin-left: ' + Ileft + 'px;color: black;margin-top: -6px;"></span>';
                                                    }
                                                    getWid = "";
                                                }
                                                else {
                                                    //HORIZANTAL CODE---------
                                                    var Height = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    if (parseInt(Height) < 0) {
                                                        Height = (parseInt(Height) * -1) - 15;
                                                    } else {
                                                        Height = parseInt(Height) - 15;
                                                    }
                                                    var LMargin_Left = "23";
                                                    var LMargin_top = ((parseInt(rowCount) - parseInt(txtCount)) * 24) - 8;
                                                    if (parseInt(LMargin_top) < 0) {
                                                        LMargin_top = parseInt(LMargin_top) * -1;
                                                    }

                                                    //VERTICAL CODE---------
                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid[0].CurrentData = (parseInt(getWid[0].CurrentData)) * -1;
                                                    }
                                                    getWid[0].CurrentData = parseInt(getWid[0].CurrentData) - 1;
                                                    var NormalHeight = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    var MarginTop = (parseInt(NormalHeight) + 10);
                                                    var Width = ((parseInt(getWid[0].CurrentData)) * 24) + 6;

                                                    var Margin_Left = parseInt(getWid[0].CurrentData) * 24;
                                                    if (SFBoolean == false) {
                                                        SFBoolean = true;
                                                    }
                                                    //Predecssor check
                                                    var txtFlag = false;
                                                    var PredicType = "";
                                                    var maxTextcount = recheckData(Predeccsors);
                                                    for (var a = 0; a < maxTextcount.length; a++) {
                                                        if (rowCount < maxTextcount[a].textCount) {
                                                            txtFlag = true;
                                                            PredicType = maxTextcount[a].StringType;
                                                            break;
                                                        }
                                                    }
                                                    //SPAN ARROW CODE---------
                                                    var arrowTop = 26;
                                                    var arrowLeft = 3;
                                                    if (parseInt(MarginTop) < 0) {
                                                        MarginTop = parseInt(MarginTop) * -1;
                                                    } if (parseInt(MarginTop) < 0) {
                                                        MarginTop = parseInt(MarginTop) * -1;
                                                    }
                                                    if (FS_flag) {
                                                        if (txtFlag && PredicType == "FS") {
                                                            arrowLeft = '-' + 11;
                                                        }
                                                    }
                                                    else {
                                                        if (txtFlag == true && maxTextcount.length < 3 && PredicType == 'FS')
                                                            Margin_Left = parseInt(Margin_Left) + 13;
                                                        else {
                                                            if (txtFlag == true && PredicType == 'FF' && FFBoolean == false && maxTextcount.length < 3)
                                                                MarginTop = parseInt(MarginTop) + 10;
                                                            else if (txtFlag == true && PredicType == 'FF' && FFBoolean == true)
                                                                arrowTop = 37;
                                                            else if (maxTextcount.length > 2 && txtFlag == true && PredicType == 'FS')
                                                                Margin_Left = parseInt(Margin_Left) + 13;
                                                        }
                                                    }
                                                    if (!reverseFlag) {
                                                        lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:-' + LMargin_top + 'px;margin-left: ' + LMargin_Left + 'px;"></span>'
                                                        widthLine += '<span style="margin-top: -' + MarginTop + 'px;width:' + Width + 'px;background: black;height: 1px;margin-left:-' + Margin_Left + 'px !important;float: left;"></span>'
                                                        spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + arrowLeft + 'px;color: black;margin-top: -' + arrowTop + 'px;"></span>';
                                                        getWid = "";
                                                    } else {
                                                        Height = parseInt(Height) + 5;
                                                        arrowTop = parseInt(arrowTop) - 5;
                                                        var SideWidth = ((parseInt(getWid[0].JoinData) + 1) * 24) + 5;
                                                        SideWidth = SideWidth < 0 ? parseInt(SideWidth) * -1 : SideWidth;
                                                        var SideLeft = ((parseInt(getWid[0].JoinData) + 2) * 24) - 6;
                                                        var MainLeft = ((parseInt(getWid[0].JoinData) + 2) * 24) + 4;
                                                        if (!getWid[0].Flag) {
                                                            LMargin_Left = ((parseInt(getWid[0].JoinData) + 2) * 24) + 4;
                                                            LMargin_Left = parseInt(LMargin_Left) < 0 ? parseInt(LMargin_Left) * -1 : LMargin_Left;
                                                            LMargin_Left = '-' + LMargin_Left;
                                                        }

                                                        lineLst += '<span class="fn-label-line" style="height: ' + Height + 'px !important;width: 1px;bottom:0px;top:-' + LMargin_top + 'px;margin-left: ' + MainLeft + 'px;"></span>';
                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + SideWidth + 'px;bottom:0px;top: -3px;margin-left: ' + LMargin_Left + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: 10px;bottom:0px;top: -' + LMargin_top + 'px;margin-left: ' + SideLeft + 'px;"></span>';
                                                        spanDown += '<span style="float: left;font-size: 9px;margin-left: ' + arrowLeft + 'px;color: black;margin-top: -' + arrowTop + 'px;" class="fa fa-arrow-down"></span>';
                                                        getWid = "";
                                                    }
                                                }
                                            }
                                            if (StringType == "FF") {
                                                //HORIZANTAL CODE----------
                                                if (rowCount < txtCount) {
                                                    var Height = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    Height = parseInt(Height) < 0 ? parseInt(Height) * -1 : parseInt(Height);
                                                    Height = parseInt(Height) - 18;

                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid[0].CurrentData = parseInt(getWid[0].CurrentData) * -1;
                                                    }
                                                    var LMargin_Left = ((parseInt(getWid[0].CurrentData) + 1) * 24) + 17;
                                                    var LMargin_top = ((parseInt(txtCount) - parseInt(rowCount)) * 24);
                                                    if (parseInt(LMargin_top) < 0) {
                                                        LMargin_top = parseInt(LMargin_top) * -1;
                                                    }
                                                    LMargin_top = 26;
                                                    //VERTICAL CODE --------
                                                    if (FF_flag == false) {
                                                        FF_flag = true;
                                                    }
                                                    var NormalHeight = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    var MarginTop = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    MarginTop = parseInt(MarginTop) < 0 ? parseInt(MarginTop) * -1 : parseInt(MarginTop);
                                                    MarginTop = parseInt(MarginTop) + 7;

                                                    var Width = ((parseInt(getWid[0].siblingData)) * 24);
                                                    if (parseInt(Width) < 0) {
                                                        Width = parseInt(Width) * -1;
                                                    }
                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid[0].CurrentData = parseInt(getWid[0].CurrentData) * -1;
                                                    }
                                                    else if (parseInt(getWid[0].siblingData) < 0) {
                                                        getWid[0].siblingData = parseInt(getWid[0].siblingData) * -1;
                                                    }
                                                    var Margin_Left = (((parseInt(getWid[0].CurrentData) + 1) * 24) - (parseInt(getWid[0].siblingData) * 24)) + 18;

                                                    var Span_MarginLeft = ((parseInt(getWid[0].CurrentData) + 1) * 24) - 3;
                                                    if (SSBoolean) {
                                                        Margin_Left = (((parseInt(getWid[0].CurrentData) + 1) * 24) - (parseInt(getWid[0].siblingData) * 24)) + 16;
                                                        LMargin_Left = LMargin_Left - 2;
                                                    } var HSTOP = "";
                                                    if (FFBoolean == false) {
                                                        FFBoolean = true;
                                                        HSTOP = 0;
                                                    } else {
                                                        HSTOP = -10;
                                                    }
                                                    var Float = "left";
                                                    var SP = Predeccsors;
                                                    SP = SP.indexOf('SS');
                                                    if (SP > 0)
                                                        Float = "right";
                                                    if (!reverseFlag) {
                                                        lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:' + LMargin_top + 'px;margin-left: ' + LMargin_Left + 'px;"></span>'

                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + Width + 'px;bottom:0px;top: ' + MarginTop + 'px;margin-left: ' + Margin_Left + 'px;"></span>'
                                                        if (SSBoolean) {
                                                            SSBoolean = false;
                                                            spanDown += '<span class="fa fa-arrow-up" style="float: ' + Float + ';font-size: 10px;margin-left: ' + Span_MarginLeft + 'px;color: black;margin-top: ' + HSTOP + 'px;"></span>';
                                                        } else {
                                                            spanDown += '<span class="fa fa-arrow-up" style="float: ' + Float + ';font-size: 10px;margin-left: ' + Span_MarginLeft + 'px;color: black;margin-top: ' + HSTOP + 'px;"></span>';
                                                        }
                                                    } else {
                                                        Height = parseInt(Height) + 4;
                                                        LMargin_top = parseInt(LMargin_top) - 5;
                                                        Width = parseInt(Width) + 9;
                                                        var R_left = ((parseInt(getWid[0].JoinData) + 2) * 24);
                                                        var Initial_left = ((parseInt(getWid[0].JoinData)) * 24);
                                                        if (R_left < 0 || Initial_left < 0) {
                                                            R_left = parseInt(R_left) * -1;
                                                            Initial_left = parseInt(Initial_left) * -1;
                                                        }
                                                        Initial_left = parseInt(Initial_left) - 6;
                                                        var L_left = parseInt(R_left) + 3;
                                                        var C_left = parseInt(R_left) - 6;
                                                        var SpanTop = 6;
                                                        if (!getWid[0].Flags) {
                                                            Width = parseInt(Width) - 17;
                                                            Initial_left = (parseInt(R_left)) + 3;
                                                            SpanTop = 9;
                                                        }
                                                        lineLst += '<span class="fn-label-line" style="height: ' + Height + 'px !important;width: 1px;bottom:0px;top: ' + LMargin_top + 'px;margin-left:' + L_left + 'px;"></span>';
                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: 10px;bottom:0px;top: ' + MarginTop + 'px;margin-left: ' + C_left + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: ' + Width + 'px;bottom:0px;top: ' + LMargin_top + 'px;margin-left:' + Initial_left + 'px;"></span>';
                                                        spanDown += '<span class="fa fa-arrow-up" style="font-size: 10px;float:left;margin-left: ' + Span_MarginLeft + 'px;color: black;margin-top: -' + SpanTop + 'px;"></span>';
                                                    }
                                                    getWid = "";


                                                }
                                                else {
                                                    //HORIZANTAL CODE
                                                    var Height = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    if (parseInt(Height) < 0) {
                                                        Height = (parseInt(Height) * -1) - 15;
                                                    } else {
                                                        Height = parseInt(Height) - 15;
                                                    }

                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid[0].CurrentData = parseInt(getWid[0].CurrentData) * -1;
                                                    }
                                                    var LMargin_Left = ((parseInt(getWid[0].CurrentData) + 1) * 24) + 18;
                                                    var LMargin_top = ((parseInt(rowCount) - parseInt(txtCount)) * 24) - 8;
                                                    if (parseInt(LMargin_top) < 0) {
                                                        LMargin_top = parseInt(LMargin_top) * -1;
                                                    }
                                                    //VERTICAL CODE
                                                    var NormalHeight = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    var MarginTop = (parseInt(NormalHeight) + 10);
                                                    var Width = ((parseInt(getWid[0].siblingData)) * 24);
                                                    if (parseInt(Width) < 0) {
                                                        Width = parseInt(Width) * -1;
                                                    }
                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid.CurrentData = parseInt(getWid[0].CurrentData) * -1;
                                                    }
                                                    // SPAN ARROW CODE
                                                    var Margin_Left = (((parseInt(getWid[0].CurrentData) + 1) * 24) - parseInt(Width)) + 2;
                                                    var Span_MarginLeft = ((parseInt(getWid[0].CurrentData) + 1) * 24) - 2;
                                                    if (!SFBoolean) {
                                                        SFBoolean = true;
                                                    }
                                                    var txtFlag = false;
                                                    var PredicType = "";
                                                    var maxTextcount = recheckData(Predeccsors);
                                                    for (var a = 0; a < maxTextcount.length; a++) {
                                                        if (rowCount < maxTextcount[a].textCount) {
                                                            txtFlag = true;
                                                            PredicType = maxTextcount[a].StringType;
                                                            break;
                                                        }
                                                    }
                                                    var arrowTop = 26;
                                                    if (FF_flag)
                                                        arrowTop = 37;
                                                    if (txtFlag == true && PredicType == "FS" && FF_flag == false && maxTextcount.length < 3) {

                                                        MarginTop = parseInt(MarginTop) + 10;
                                                    }
                                                    else
                                                        if (FF_flag == true && PredicType == "FF" && txtFlag == true)
                                                            MarginTop = parseInt(MarginTop);
                                                        else
                                                            if (PredicType == "FF" && txtFlag == true)
                                                                MarginTop = parseInt(MarginTop) + 10;
                                                    if (!reverseFlag) {
                                                        lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:-' + LMargin_top + 'px;margin-left: ' + LMargin_Left + 'px;"></span>'

                                                        widthLine += '<span style="margin-top: -' + MarginTop + 'px;width:' + Width + 'px;background: black;height: 1px;margin-left:' + Margin_Left + 'px !important;float: left;"></span>'

                                                        spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + Span_MarginLeft + 'px;color: black;margin-top: -' + arrowTop + 'px;"></span>';
                                                        getWid = "";
                                                    }
                                                    else {

                                                        if (!getWid[0].Flag) {
                                                            Width = parseInt(Width) - 17;
                                                            var CommonData = parseInt(getWid[0].JoinData);
                                                            if (CommonData < 0) {
                                                                CommonData = parseInt(CommonData) * -1;
                                                            }
                                                            var WidthMarginLeft = ((parseInt(CommonData) - 2) * 24) + 5;
                                                            WidthMarginLeft = '-' + WidthMarginLeft;
                                                            var DivideMarginLeft = ((parseInt(CommonData) - 2) * 24) - 4;
                                                            DivideMarginLeft = '-' + DivideMarginLeft;
                                                            var SideMarginLeft = ((parseInt(CommonData) - 2) * 24) - 4;
                                                            SideMarginLeft = '-' + SideMarginLeft;

                                                        }
                                                        else {
                                                            Span_MarginLeft = parseInt(Span_MarginLeft) - 7;
                                                            var SideMarginLeft = ((parseInt(getWid[0].CurrentData) + 4) * 24) + 3;
                                                            var WidthMarginLeft = (((parseInt(getWid[0].CurrentData) + 4) * 24) + 3) - 10;
                                                            var DivideMarginLeft = ((parseInt(getWid[0].CurrentData) + 1) * 24) + 11;
                                                            Width = parseInt(Width) + 17;
                                                            if (!getWid[0].secondary) {
                                                                Width = parseInt(Width) - 34;
                                                                var CommonData = parseInt(getWid[0].JoinData);
                                                                if (CommonData < 0) {
                                                                    CommonData = parseInt(CommonData) * -1;
                                                                }
                                                                var WidthMarginLeft = ((parseInt(CommonData) + 2) * 24) - 5;
                                                                var DivideMarginLeft = ((parseInt(CommonData) + 2) * 24) + 4;
                                                                var SideMarginLeft = ((parseInt(CommonData) + 2) * 24) + 4;

                                                            }
                                                        }
                                                        lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:-' + LMargin_top + 'px;margin-left: ' + SideMarginLeft + 'px;"></span>'

                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: 10px;bottom:0px;top: -' + LMargin_top + 'px;margin-left: ' + WidthMarginLeft + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: ' + Width + 'px;bottom:0px;top: -8px;margin-left: ' + DivideMarginLeft + 'px;"></span>'

                                                        spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + Span_MarginLeft + 'px;color: black;margin-top: -' + arrowTop + 'px;"></span>';
                                                        getWid = "";
                                                    }

                                                }
                                            }
                                            if (StringType == "SS") {
                                                if (rowCount < txtCount) {
                                                    //HARIZANTAL CODE
                                                    var Height = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(Height) < 0)
                                                        Height = parseInt(Height) * -1;
                                                    var LMargin_top = 10;
                                                    getWid[0].siblingData = parseInt(getWid[0].siblingData)
                                                    if (parseInt(getWid[0].siblingData) < 0) {
                                                        getWid[0].siblingData = (parseInt(getWid[0].siblingData) * -1);
                                                    }
                                                    getWid[0].siblingData = parseInt(getWid[0].siblingData);

                                                    var MarginTop = 8;
                                                    var Width = parseInt(getWid[0].siblingData) * 24;
                                                    if (parseInt(Width) < 0) {
                                                        Width = parseInt(Width) * -1;
                                                    }
                                                    var LMargin_Left = Width;
                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid[0].CurrentData = parseInt(getWid[0].CurrentData) * -1;
                                                    }
                                                    else if (parseInt(getWid[0].siblingData) < 0) {
                                                        getWid[0].siblingData = parseInt(getWid[0].siblingData) * -1;
                                                    }
                                                    var Margin_Left = 17;
                                                    //VERTICAL CODE && SPAN ARROW CODE
                                                    var SpanMTop = 12;
                                                    var WTop = ((parseInt(txtCount) - parseInt(rowCount)) * 24);
                                                    WTop = parseInt(WTop) < 0 ? parseInt(WTop) * -1 : WTop;
                                                    WTop = parseInt(WTop) - 8;
                                                    var W_MarginLeft = parseInt(Width) + 17;
                                                    if (parseInt(W_MarginLeft) < 0) {
                                                        W_MarginLeft = parseInt(W_MarginLeft) * -1;
                                                    }
                                                    var Ileft = 17;
                                                    if (Defult == true) {
                                                        W_MarginLeft = parseInt(W_MarginLeft) + 14;
                                                        Ileft = parseInt(Ileft) + 14;
                                                    }
                                                    var Float = "left";
                                                    var FontSize = 9;
                                                    //Initaila loop
                                                    if (SSBoolean == false)
                                                        SSBoolean = true;
                                                    else
                                                        SSBoolean = false;
                                                    if (!reverseFlag) {
                                                        if (getWid[0].Boolean) {
                                                            if (Predeccsors.indexOf('FF') > 0 && record.length > 2) {

                                                                MarginTop = 18;
                                                                W_MarginLeft = parseInt(W_MarginLeft) - 14;
                                                                SpanMTop = SpanMTop + 9;
                                                                FontSize = 8;
                                                                Ileft = parseInt(Ileft) - 14;
                                                                WTop = WTop - 10;
                                                                if (record.length > 3) {
                                                                    MarginTop = 28;
                                                                    SpanMTop = SpanMTop;
                                                                    WTop = WTop - 10;
                                                                }
                                                            }

                                                            lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:' + LMargin_top + 'px;margin-left: -' + LMargin_Left + 'px;"></span>'

                                                            widthLine += '<span style="margin-top: ' + WTop + 'px;width: 15px;background: black;height: 1px;margin-left: -' + W_MarginLeft + 'px !important;float: left;"></span><span style="margin-top: -' + MarginTop + 'px;width:' + Width + 'px;background: black;height: 1px;margin-left:-' + W_MarginLeft + 'px !important;float: left;"></span>'

                                                            spanDown += '<span class="fa fa-arrow-right" style="float: ' + Float + ';font-size: ' + FontSize + 'px;margin-left: -' + Ileft + 'px;color: black;margin-top:-' + SpanMTop + 'px;"></span>';
                                                            getWid = "";
                                                        }
                                                        else {

                                                            lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:' + LMargin_top + 'px;margin-left: -' + LMargin_Left + 'px;"></span>'

                                                            widthLine += '<span style="margin-top: ' + WTop + 'px;width: 15px;background: black;height: 1px;margin-left: -' + W_MarginLeft + 'px !important;float: left;"></span><span style="margin-top: -' + MarginTop + 'px;width:' + Width + 'px;background: black;height: 1px;margin-left:-' + W_MarginLeft + 'px !important;float: left;"></span>'

                                                            spanDown += '<span class="fa fa-arrow-right" style="float: ' + Float + ';font-size: 9px;margin-left: -' + Ileft + 'px;color: black;margin-top:-' + SpanMTop + 'px;"></span>';
                                                            getWid = "";
                                                        }
                                                    }
                                                    else {
                                                        if (getWid[0].Boolean) {
                                                            lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:' + LMargin_top + 'px;margin-left: -' + LMargin_Left + 'px;"></span>'

                                                            widthLine += '<span style="margin-top: ' + WTop + 'px;width: 15px;background: black;height: 1px;margin-left: -' + W_MarginLeft + 'px !important;float: left;"></span><span style="margin-top: -' + MarginTop + 'px;width:' + Width + 'px;background: black;height: 1px;margin-left:-' + W_MarginLeft + 'px !important;float: left;"></span>'

                                                            spanDown += '<span class="fa fa-arrow-right" style="float: ' + Float + ';font-size: 9px;margin-left: -' + Ileft + 'px;color: black;margin-top:-' + SpanMTop + 'px;"></span>';
                                                            getWid = "";
                                                        }
                                                        else {

                                                            Width = parseInt(Width) + 16;
                                                            WTop = parseInt(WTop) + 17;
                                                            lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:' + LMargin_top + 'px;margin-left: 0px;"></span>';
                                                            widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + Width + 'px;bottom:0px;top: ' + WTop + 'px;margin-left: 0px;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-right" style="float: left;font-size: 9px;margin-left: -' + Ileft + 'px;color: black;margin-top:-' + SpanMTop + 'px;"></span>';
                                                        }

                                                    }

                                                }
                                                else {
                                                    //VERTICAL-----------------
                                                    var L_Height = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(L_Height) < 0)
                                                        L_Height = parseInt(L_Height) * -1;

                                                    L_Height = (parseInt(L_Height)) - 15;
                                                    var L_Top = ((parseInt(txtCount) - parseInt(rowCount)) * 24);
                                                    if (parseInt(L_Top) < 0) {
                                                        L_Top = parseInt(L_Top) * -1;

                                                    }
                                                    L_Top = parseInt(L_Top) - 10;

                                                    var L_Mleft = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(L_Mleft) < 0) {
                                                        L_Mleft = parseInt(L_Mleft) * -1;
                                                    }

                                                    //SUB VERTICAL LINE


                                                    var L_Mleft = parseInt(getWid[0].siblingData);
                                                    if (parseInt(L_Mleft) < 0) {
                                                        L_Mleft = parseInt(L_Mleft) * -1;
                                                    }
                                                    L_Mleft = (parseInt(L_Mleft) * 24) - 8;


                                                    var V_left = getWid[0].siblingData;
                                                    if (parseInt(V_left) < 0) {
                                                        V_left = parseInt(V_left) * -1;
                                                    }
                                                    V_left = (parseInt(V_left) * 24) + 8;
                                                    var V_Top = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(V_Top) < 0) {
                                                        V_Top = parseInt(V_Top) * -1;
                                                    }
                                                    V_Top = parseInt(V_Top) + 8;
                                                    // HORIZANTAL--------------

                                                    var W_Width = getWid[0].siblingData;
                                                    if (parseInt(W_Width) < 0)
                                                        W_Width = (parseInt(W_Width)) * -1;
                                                    if (W_Width == 0)
                                                        W_Width = 12;
                                                    else
                                                        W_Width = (parseInt(W_Width) * 24) + 12;

                                                    var W_Mleft = getWid[0].siblingData;
                                                    if (parseInt(W_Mleft) < 0) {
                                                        W_Mleft = parseInt(W_Mleft) * -1;
                                                    }
                                                    W_Mleft = (parseInt(W_Mleft) * 24) + 8;
                                                    var W_top = 24;
                                                    ///T_Span
                                                    var T_Top = (((parseInt(txtCount) - parseInt(rowCount)) * 24) / 2) + 2;
                                                    //SPAN ARROW CODE----------------
                                                    var S_Mleft = getWid[0].siblingData;
                                                    S_Mleft = 0;
                                                    S_TOP = 24;
                                                    // special Line
                                                    var D_Mleft = getWid[0].siblingData;
                                                    if (parseInt(D_Mleft) < 0)
                                                        D_Mleft = parseInt(D_Mleft) * -1;

                                                    var q_Mleft = getWid[0].CurrentData;

                                                    if (parseInt(q_Mleft) < 0)
                                                        q_Mleft = parseInt(q_Mleft) * -1;

                                                    q_Mleft = ((parseInt(q_Mleft) + 2) * 24) + 5;

                                                    var q_Top = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(q_Top) < 0)
                                                        q_Top = parseInt(q_Top) * -1;
                                                    q_Top = (parseInt(q_Top) / 2) - 2;
                                                    if (!SFBoolean) {
                                                        SFBoolean = true;
                                                    }
                                                    var txtFlag = false;
                                                    var PredicType = "";
                                                    var maxTextcount = recheckData(Predeccsors);
                                                    for (var a = 0; a < maxTextcount.length; a++) {
                                                        if (rowCount < maxTextcount[a].textCount) {
                                                            txtFlag = true;
                                                            PredicType = maxTextcount[a].StringType;
                                                            break;
                                                        }
                                                    }
                                                    var new_Top = 24;
                                                    if (txtFlag && PredicType == "FF" && !FF_flag) {
                                                        new_Top = 34;
                                                        W_top = parseInt(W_top) + 10;
                                                    } else {
                                                        if (txtFlag && PredicType == "FF" && FF_flag)
                                                            S_TOP = parseInt(S_TOP) + 10;
                                                        else {
                                                            if (txtFlag && PredicType == "FS" && !FF_flag) {
                                                                V_left = parseInt(V_left) + 15;
                                                                W_Mleft = parseInt(W_Mleft) + 15;

                                                            }
                                                        }
                                                    }
                                                    if (!reverseFlag) {
                                                        if (getWid[0].Boolean) {
                                                            var D_height = parseInt(L_Height) - 9;
                                                            var D_Top = (parseInt(txtCount) - parseInt(rowCount)) * 18;
                                                            if (parseInt(D_Top) < 0)
                                                                D_Top = parseInt(D_Top) * -1;
                                                            var A_Mleft = ((parseInt(D_Mleft) + 2) * 24) - 18;
                                                            var D_Width = (D_Mleft * 24) + 12;
                                                            lineLst += '<span class="fn-label-line" style="height: ' + D_height + 'px !important;width: 1px;bottom:0px;top: -' + D_Top + 'px;margin-left:' + A_Mleft + 'px;"></span>';
                                                            widthLine += '<span class="fn-label-line" style="height:' + 0 + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left: -' + L_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 0px;background: black;height: 1px;margin-left: -' + V_left + 'px;float: left;"></span><span style="margin-top:-' + new_Top + 'px;width:' + D_Width + 'px;background: black;height: 1px;margin-left: 3px;float: left;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';
                                                        }
                                                        else {
                                                            lineLst += '<span class="fn-label-line" style="height:0px !important;width: 1px;bottom:0px;top:0px;margin-left:0px;"></span>';
                                                            widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left: -' + L_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left: -' + V_left + 'px;float: left;"></span><span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left:-' + W_Mleft + 'px;float: left;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';
                                                        }
                                                    }
                                                    else {
                                                        var AWidth = (parseInt(getWid[0].siblingData) * 24) - 4;
                                                        var Common_Top = ((parseInt(txtCount) - parseInt(rowCount)) * 24);
                                                        var A_Top = 0;
                                                        if (parseInt(A_Top) < 0 || parseInt(Common_Top) < 0) {
                                                            A_Top = parseInt(Common_Top) * -1;
                                                            Common_Top = parseInt(Common_Top) * -1;
                                                        }
                                                        A_Top = parseInt(A_Top) - 9;
                                                        if (A_Top < 0)
                                                            A_Top = parseInt(A_Top) * -1;
                                                        Common_Top = parseInt(Common_Top) - 12;
                                                        if (!getWid[0].Boolean) {

                                                            lineLst += '<span class="fn-label-line" style="height:0px !important;width: 1px;bottom:0px;top:0px;margin-left:0px;"></span>';
                                                            widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left: -' + L_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left: -' + V_left + 'px;float: left;"></span><span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left:-' + W_Mleft + 'px;float: left;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';

                                                        } else {
                                                            lineLst += '<span class="fn-label-line" style="height: ' + Common_Top + 'px !important;width: 1px;bottom:0px;top:-' + A_Top + 'px;margin-left: 20px;"></span>';
                                                            widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + AWidth + 'px;bottom:0px;top: -' + A_Top + 'px;margin-left: 20px;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: 0px;color: black;margin-top:-' + S_TOP + 'px;"></span>';

                                                        }
                                                    }
                                                    getWid = "";
                                                }
                                            }
                                            if (StringType == "SF") {
                                                if (rowCount < txtCount) {
                                                    //VERTICAL-----------------
                                                    var L_Height = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(L_Height) < 0)
                                                        L_Height = parseInt(L_Height) * -1;

                                                    L_Height = parseInt(L_Height) - 12;
                                                    var L_Top = ((parseInt(txtCount) - parseInt(rowCount)) * 24) - 3;

                                                    var L_Mleft = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(L_Mleft) < 0) {
                                                        L_Mleft = parseInt(L_Mleft) * -1;
                                                    }
                                                    L_Mleft = parseInt(L_Mleft) + 3;

                                                    // HORIZANTAL--------------

                                                    var W_Width = getWid[0].siblingData;
                                                    if (parseInt(W_Width) < 0)
                                                        W_Width = parseInt(W_Width) * -1;

                                                    W_Width = ((parseInt(W_Width) + 2) * 24) + 2;

                                                    var W_Mleft = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(W_Mleft) < 0) {
                                                        W_Mleft = parseInt(W_Mleft) * -1;
                                                    }
                                                    W_Mleft = parseInt(W_Mleft) + 3;
                                                    ///T_Span
                                                    var T_Top = ((parseInt(txtCount) - parseInt(rowCount)) * 24) + 8;
                                                    //SPAN ARROW CODE----------------
                                                    var S_Mleft = getWid[0].CurrentData;
                                                    if (parseInt(S_Mleft) < 0)
                                                        S_Mleft = parseInt(S_Mleft) * -1;
                                                    S_Mleft = ((parseInt(S_Mleft) + 1) * 24) + 3;
                                                    var S_TOP = 13;

                                                    // special Line
                                                    var q_Mleft = getWid[0].CurrentData;
                                                    if (parseInt(q_Mleft) < 0)
                                                        q_Mleft = parseInt(q_Mleft) * -1;

                                                    q_Mleft = ((parseInt(q_Mleft) + 2) * 24) + 4;

                                                    var q_Top = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(q_Top) < 0)
                                                        q_Top = parseInt(q_Top) * -1;

                                                    q_Top = (parseInt(q_Top) / 2) - 2;
                                                    if (Defult == true) {
                                                        S_TOP = parseInt(S_TOP) + 10;
                                                        W_Width = parseInt(W_Width) + 5;
                                                        T_Top = parseInt(T_Top) + 1;

                                                    }
                                                    if (!reverseFlag) {
                                                        if (getWid[0].Flags) {
                                                            lineLst += '<span class="fn-label-line" style="height: ' + L_Height + 'px !important;width: 1px;bottom:0px;top: ' + 21 + 'px;margin-left: ' + L_Mleft + 'px;"></span>';
                                                            var D_Width = getWid[0].siblingData;
                                                            if (D_Width < 0) {
                                                                D_Width = parseInt(D_Width) * -1;
                                                            }
                                                            D_Width = (parseInt(D_Width) - 2) * 24;
                                                            var D_left = parseInt(D_Width) + 4;
                                                            widthLine += '<span class="fn-label-line" style = "height:' + 12 + 'px !important;width: 1px;bottom:0px;top: ' + 9 + 'px;margin-left: ' + q_Mleft + 'px;" ></span ><span class="fn-label-line" style="height: 1px !important;width: ' + D_Width + 'px;bottom:0px;top: 20px;margin-left: ' + q_Mleft + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: 15px;bottom:0px;top: ' + T_Top + 'px;margin-left: ' + W_Mleft + 'px;"></span>';
                                                            if (FFBoolean) {
                                                                S_TOP = parseInt(S_TOP) + 11;
                                                            }
                                                        }
                                                        else {
                                                            if (getWid[0].Booliean == true) {
                                                                lineLst += '<span class="fn-label-line" style="height: ' + L_Height + 'px !important;width: 1px;bottom:0px;top: ' + 21 + 'px;margin-left: -' + L_Mleft + 'px;"></span>';
                                                                widthLine += '<span class="fn-label-line" style = "height:' + 12 + 'px !important;width: 1px;bottom:0px;top: ' + 9 + 'px;margin-left: ' + q_Mleft + 'px;" ></span ><span class="fn-label-line" style="height: 1px !important;width: ' + W_Width + 'px;bottom:0px;top: 20px;margin-left:-' + W_Mleft + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: 15px;bottom:0px;top: ' + T_Top + 'px;margin-left: -' + W_Mleft + 'px;"></span>';
                                                            }

                                                            else {
                                                                lineLst += '<span class="fn-label-line" style="height: ' + L_Height + 'px !important;width: 1px;bottom:0px;top: ' + 21 + 'px;margin-left: ' + L_Mleft + 'px;"></span>';
                                                                widthLine += '<span class="fn-label-line" style = "height:' + 12 + 'px !important;width: 1px;bottom:0px;top: ' + 9 + 'px;margin-left: ' + q_Mleft + 'px;" ></span ><span class="fn-label-line" style="height: 1px !important;width: ' + W_Width + 'px;bottom:0px;top: 20px;margin-left: ' + W_Mleft + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: 15px;bottom:0px;top: ' + T_Top + 'px;margin-left: ' + W_Mleft + 'px;"></span>';
                                                            }
                                                            if (FFBoolean) {
                                                                S_TOP = parseInt(S_TOP) + 11;
                                                            }
                                                        }
                                                        spanDown += '<span class="fa fa-arrow-left" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top: -' + S_TOP + 'px;"></span>';
                                                    }
                                                    else {
                                                        var height = ((parseInt(txtCount) - parseInt(rowCount)) * 24) - 1;
                                                        var D_Width = getWid[0].siblingData;
                                                        if (D_Width < 0) {
                                                            D_Width = parseInt(D_Width) * -1;
                                                        }
                                                        T_Top = parseInt(T_Top) - 1;
                                                        D_Width = ((parseInt(D_Width) - 1) * 24) - 9;
                                                        if (!getWid[0].Flags) {
                                                            if (getWid[0].Booliean == true) {
                                                                lineLst += '<span class="fn-label-line" style="height: ' + L_Height + 'px !important;width: 1px;bottom:0px;top: ' + 21 + 'px;margin-left: -' + L_Mleft + 'px;"></span>';
                                                                widthLine += '<span class="fn-label-line" style = "height:' + 12 + 'px !important;width: 1px;bottom:0px;top: ' + 9 + 'px;margin-left: ' + q_Mleft + 'px;" ></span ><span class="fn-label-line" style="height: 1px !important;width: ' + W_Width + 'px;bottom:0px;top: 20px;margin-left:-' + W_Mleft + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: 15px;bottom:0px;top: ' + T_Top + 'px;margin-left: -' + W_Mleft + 'px;"></span>';
                                                            }

                                                            else {
                                                                lineLst += '<span class="fn-label-line" style="height: ' + L_Height + 'px !important;width: 1px;bottom:0px;top: ' + 21 + 'px;margin-left: ' + L_Mleft + 'px;"></span>';
                                                                widthLine += '<span class="fn-label-line" style = "height:' + 12 + 'px !important;width: 1px;bottom:0px;top: ' + 9 + 'px;margin-left: ' + q_Mleft + 'px;" ></span ><span class="fn-label-line" style="height: 1px !important;width: ' + W_Width + 'px;bottom:0px;top: 20px;margin-left: ' + W_Mleft + 'px;"></span><span class="fn-label-line" style="height: 1px !important;width: 15px;bottom:0px;top: ' + T_Top + 'px;margin-left: ' + W_Mleft + 'px;"></span>';
                                                            }
                                                            if (FFBoolean) {
                                                                S_TOP = parseInt(S_TOP) + 11;
                                                            } else { S_TOP = parseInt(S_TOP) - 7; }
                                                            spanDown += '<span class="fa fa-arrow-left" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top: -' + S_TOP + 'px;"></span>';
                                                        } else {
                                                            lineLst += '<span class="fn-label-line" style="height: ' + height + 'px !important;width: 1px;bottom:0px;top: 8px;margin-left: ' + q_Mleft + 'px;"></span>';
                                                            widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + D_Width + 'px;bottom:0px;top: ' + T_Top + 'px;margin-left: ' + q_Mleft + 'px;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-left" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top: -' + S_TOP + 'px;"></span>';
                                                        }
                                                    }
                                                    getWid = "";

                                                }
                                                else {
                                                    //VERTICAL---------------------------------------------------
                                                    var L_Height = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(L_Height) < 0)
                                                        L_Height = parseInt(L_Height) * -1;

                                                    L_Height = (parseInt(L_Height)) - 15;
                                                    var L_Top = ((parseInt(txtCount) - parseInt(rowCount)) * 24);
                                                    if (parseInt(L_Top) < 0) {
                                                        L_Top = parseInt(L_Top) * -1;
                                                    }
                                                    L_Top = parseInt(L_Top) - 10;
                                                    var L_Mleft = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(L_Mleft) < 0) {
                                                        L_Mleft = parseInt(L_Mleft) * -1;
                                                    }
                                                    L_Mleft = parseInt(L_Mleft) + 8;
                                                    //SUB VERTICAL LINE
                                                    var V_left = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(V_left) < 0) {
                                                        V_left = parseInt(V_left) * -1;
                                                    }
                                                    V_left = parseInt(V_left) - 8;
                                                    var L_left = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(V_left) < 0) {
                                                        L_left = parseInt(L_left) * -1;
                                                    }
                                                    var V_Top = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(V_Top) < 0) {
                                                        V_Top = parseInt(V_Top) * -1;
                                                    }
                                                    V_Top = parseInt(V_Top) + 8;
                                                    // HORIZANTAL--------------

                                                    var W_Width = getWid[0].siblingData;
                                                    if (parseInt(W_Width) < 0)
                                                        W_Width = (parseInt(W_Width)) * -1;

                                                    W_Width = ((parseInt(W_Width) + 1) * 24) + 8;

                                                    var W_Mleft = parseInt(getWid[0].JoinData) * 24;
                                                    if (parseInt(W_Mleft) < 0) {
                                                        W_Mleft = parseInt(W_Mleft) * -1;
                                                    }
                                                    W_Mleft = parseInt(W_Mleft) - 8;
                                                    var W_top = 24;

                                                    ///T_Span
                                                    var T_Top = (((parseInt(txtCount) - parseInt(rowCount)) * 24) / 2) + 2;

                                                    //SPAN ARROW CODE----------------
                                                    var S_Mleft = getWid[0].CurrentData;
                                                    if (parseInt(S_Mleft) < 0)
                                                        S_Mleft = parseInt(S_Mleft) * -1;
                                                    S_Mleft = ((parseInt(S_Mleft) + 1) * 24) - 4;

                                                    S_TOP = 24;
                                                    // special Line
                                                    var q_Mleft = getWid[0].CurrentData;
                                                    if (parseInt(q_Mleft) < 0)
                                                        q_Mleft = parseInt(q_Mleft) * -1;
                                                    q_Mleft = ((parseInt(q_Mleft) + 2) * 24) + 5;
                                                    var q_Top = (parseInt(txtCount) - parseInt(rowCount)) * 24;
                                                    if (parseInt(q_Top) < 0)
                                                        q_Top = parseInt(q_Top) * -1;
                                                    q_Top = (parseInt(q_Top) / 2) - 2;
                                                    //chek condition
                                                    var SP = Predeccsors;
                                                    var FS = SP.indexOf("FS");
                                                    var FF = SP.indexOf("FF");
                                                    var SF = SP.indexOf("SF");
                                                    if (FS > -1 || FF > -1 || SF > -1) {
                                                        SFBoolean = true;
                                                    } else {
                                                        SFBoolean = false;
                                                    }

                                                    if (!reverseFlag) {
                                                        if (!getWid[0].Boolean) {
                                                            var D_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) : parseInt(L_Mleft);
                                                            var A_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) - 16 : parseInt(L_Mleft) - 16;
                                                            V_left = (parseInt(V_left)) < 0 ? ((parseInt(V_left)) * -1) : (parseInt(V_left));
                                                            widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left: ' + D_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left: ' + V_left + 'px;float: left;"></span> <span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left: ' + A_Mleft + 'px;float: left;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';
                                                        }
                                                        else {
                                                            if (SFBoolean) {
                                                                var D_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) - 16 : parseInt(L_Mleft) - 16;
                                                                var A_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) : parseInt(L_Mleft);
                                                                V_left = (parseInt(V_left)) < 0 ? ((parseInt(V_left)) * -1) + 16 : (parseInt(V_left)) + 16;
                                                                widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left:-' + D_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left:-' + V_left + 'px;float: left;"></span> <span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left:-' + A_Mleft + 'px;float: left;"></span>';
                                                                spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';
                                                            } else {
                                                                var D_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) - 16 : parseInt(L_Mleft) - 16;
                                                                var A_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) : parseInt(L_Mleft);
                                                                V_left = (parseInt(V_left)) < 0 ? ((parseInt(V_left)) * -1) + 16 : (parseInt(V_left)) + 16;
                                                                widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left:-' + D_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left:-' + V_left + 'px;float: left;"></span> <span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left:-' + A_Mleft + 'px;float: left;"></span>';
                                                                spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (getWid[0].Boolean) {
                                                            var D_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) : parseInt(L_Mleft);
                                                            var A_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) : parseInt(L_Mleft);
                                                            V_left = (parseInt(V_left)) < 0 ? ((parseInt(V_left)) * -1) : (parseInt(V_left));
                                                            W_top = parseInt(W_top) + 1;
                                                            widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left: -' + V_left + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left: -' + A_Mleft + 'px;float: left;"></span> <span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left:-' + D_Mleft + 'px;float: left;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';

                                                        } else {
                                                            //var heightData = ((parseInt(rowCount) - parseInt(txtCount)) * 24) - 15;
                                                            //var K_Mleft = parseInt(S_Mleft) + 4;
                                                            //S_Mleft = parseInt(S_Mleft) + 20;
                                                            ////var D_Mleft = parseInt(S_Mleft) + 20;
                                                            //var W_Width = getWid[0].siblingData;
                                                            //if (parseInt(W_Width) < 0)
                                                            //    W_Width = (parseInt(W_Width)) * -1;
                                                            //var D_Mleft = getWid[0].CurrentData;
                                                            //if (parseInt(D_Mleft) < 0)
                                                            //    D_Mleft = parseInt(D_Mleft) * -1;
                                                            //D_Mleft = ((parseInt(D_Mleft) + 1) * 24) - 4;
                                                            //W_Width = (parseInt(W_Width) - 1) * 24;
                                                            var D_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) : parseInt(L_Mleft);
                                                            var A_Mleft = (parseInt(L_Mleft)) < 0 ? (parseInt(L_Mleft) * -1) - 16 : parseInt(L_Mleft) - 16;
                                                            V_left = (parseInt(V_left)) < 0 ? ((parseInt(V_left)) * -1) : (parseInt(V_left));
                                                            if (getWid[0].SecondaryFlag) {
                                                                var W_Width = getWid[0].siblingData;
                                                                if (parseInt(W_Width) < 0)
                                                                    W_Width = (parseInt(W_Width)) * -1;
                                                                W_Width = ((parseInt(W_Width) - 1) * 24) - 6;
                                                                A_Mleft = parseInt(S_Mleft) + 3;
                                                            }

                                                            widthLine += '<span class="fn-label-line" style="height:' + L_Height + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left: ' + D_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left: ' + V_left + 'px;float: left;"></span> <span style="margin-top:-' + W_top + 'px;width:' + W_Width + 'px;background: black;height: 1px;margin-left: ' + A_Mleft + 'px;float: left;"></span>';
                                                            spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + S_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';


                                                            // widthLine += '<span class="fn-label-line" style="height:' + heightData + 'px !important;width: 1px;bottom:0px;top:-' + L_Top + 'px;margin-left:' + S_Mleft + 'px;"></span><span style="margin-top: -' + V_Top + 'px;width: 7px;background: black;height: 1px;margin-left:-' + V_left + 'px;float: left;"></span><span style="margin-top: -' + V_Top + 'px;width: ' + W_Width + 'px;background: black;height: 1px;margin-left: ' + K_Mleft + 'px;float: left;"></span>';
                                                            //spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + D_Mleft + 'px;color: black;margin-top:-' + S_TOP + 'px;"></span>';
                                                        }
                                                    }
                                                    getWid = "";
                                                }
                                            }
                                        }
                                        else {
                                            if (rowCount < txtCount) {
                                                var Height = parseInt(txtCount) - parseInt(rowCount);
                                                Height = parseInt(Height) < 0 ? parseInt(Height) * -1 : parseInt(Height);
                                                Height = (parseInt(Height) * 24) - 19;
                                                var Top = 26;
                                                var Margin_Left = 27;
                                                // HORIZANTAL CODE---------
                                                var H_Width = parseInt(getWid[0].siblingData) < 0 ? parseInt(getWid[0].siblingData) * -1 : parseInt(getWid[0].siblingData);
                                                H_Width = (parseInt(H_Width) * 24) - 14;
                                                //var H_TOP = parseInt(Height) + 8;
                                                var H_TOP = parseInt(txtCount) - parseInt(rowCount);
                                                H_TOP = parseInt(H_TOP) < 0 ? parseInt(H_TOP) * -1 : parseInt(H_TOP);
                                                H_TOP = (parseInt(H_TOP) * 24) - 12;
                                                var Ileft = "";
                                                if (IData == false) {
                                                    IData = true;
                                                    Ileft = 7;
                                                } else {
                                                    Ileft = -8;

                                                }
                                                if (!RowFlag)
                                                    RowFlag = true;

                                                var H_Marginleft = parseInt(getWid[0].siblingData);
                                                if (parseInt(getWid[0].siblingData) < 0) {
                                                    H_Marginleft = parseInt(getWid[0].siblingData) * -1;
                                                }
                                                var SP = Predeccsors;
                                                SP = SP.split(',');
                                                var Count = 0;
                                                var ColFlag = false;
                                                for (var j = 0; j < SP.length; j++) {
                                                    if (SP[j] < rowCount) {
                                                        ColFlag = true;
                                                        Count++;
                                                        break;
                                                    }
                                                    Count++;
                                                }
                                                for (var j = 0; j < SP.length; j++) {
                                                    if (dataObj) {
                                                        var EndDays = $("#shortEndDate_" + SP[j]).val();
                                                        DaysArray.push(new Date(splitSlash(EndDays)));
                                                        RowArray.push(SP[j]);
                                                    }
                                                    else {
                                                        var EndDays = $("#dpEndDate_" + SP[j]).val();
                                                        DaysArray.push(new Date(splitSlash(EndDays)));
                                                        RowArray.push(SP[j]);
                                                    }

                                                }
                                                var latest = new Date(Math.max.apply(null, DaysArray));
                                                var x = 0;
                                                for (var k = 0; k < DaysArray.length; k++) {
                                                    if (latest.toString() == DaysArray[k].toString()) {
                                                        x = RowArray[k];
                                                        break;
                                                    }
                                                }
                                                OverallCount++;
                                                if (SP.length > 1) {
                                                    if (RowFlag) {
                                                        H_Marginleft = ((parseInt(H_Marginleft) - 2) * 24) + 8;
                                                        H_Marginleft = parseInt(H_Marginleft) < 0 ? parseInt(H_Marginleft) * -1 : parseInt(H_Marginleft);
                                                        if (x == txtCount)
                                                            if (getWid[0].siblingData < -1)
                                                                H_Marginleft = '-' + H_Marginleft;
                                                            else
                                                                H_Marginleft = H_Marginleft;
                                                        else
                                                            H_Marginleft = '-' + H_Marginleft;
                                                        var D_Top = parseInt(txtCount) - parseInt(rowCount);
                                                        H_TOP = D_Top < 0 ? ((parseInt(D_Top) * -1) * 24) + 6 : (parseInt(D_Top) * 24) + 6;
                                                        lineLst += '<span class="fn-label-line" style="height: ' + Height + 'px !important;width: 1px;bottom:0px;top: ' + Top + 'px;margin-left: ' + Margin_Left + 'px;"></span>'
                                                        widthLine += '<span class="fn-label-line" style="height: 1px !important;width: ' + H_Width + 'px;bottom:0px;top: ' + H_TOP + 'px;margin-left:' + H_Marginleft + 'px;"></span>'
                                                        spanDown += '<span class="fa fa-arrow-up" style="float: left;font-size: 10px;margin-left: ' + Ileft + 'px;color: black;margin-top: 0px;"></span>';
                                                        getWid = "";
                                                    }
                                                }
                                                else {
                                                    H_Marginleft = (parseInt(H_Marginleft) * 24) - 10;
                                                    lineLst += '<span class="fn-label-line" style="height: ' + Height + 'px !important;width: 1px;bottom:0px;top: ' + Top + 'px;margin-left: ' + Margin_Left + 'px;"></span>'
                                                    widthLine += '<span style="margin-top: ' + H_TOP + 'px;width: ' + H_Width + 'px;background: black;height: 1px;margin-left: -' + H_Marginleft + 'px !important;float: left;"></span>'
                                                    spanDown += '<span class="fa fa-arrow-up" style="float: left;font-size: 10px;margin-left: ' + Ileft + 'px;color: black;margin-top: 0px;"></span>';
                                                    getWid = "";
                                                }

                                            }
                                            else {
                                                //HORIZANTAL CODE---------
                                                if (getWid.length > 0) {
                                                    var Height = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    if (parseInt(Height) < 0) {
                                                        Height = (parseInt(Height) * -1) - 9;
                                                    }
                                                    else {
                                                        Height = parseInt(Height) - 9;
                                                    }
                                                    var LMargin_Left = "27";
                                                    var LMargin_top = ((parseInt(rowCount) - parseInt(txtCount)) * 24) - 8;
                                                    if (parseInt(LMargin_top) < 0) {
                                                        LMargin_top = parseInt(LMargin_top) * -1;
                                                    }
                                                    //VERTICAL CODE---------
                                                    if (parseInt(getWid[0].CurrentData) < 0) {
                                                        getWid[0].CurrentData = (parseInt(getWid[0].CurrentData)) * -1;
                                                    }
                                                    getWid[0].CurrentData = parseInt(getWid[0].CurrentData) - 1;
                                                    var NormalHeight = (parseInt(rowCount) - parseInt(txtCount)) * 24;
                                                    var MarginTop = (parseInt(NormalHeight) + 10);
                                                    var Width = ((parseInt(getWid[0].CurrentData)) * 24) + 10;
                                                    var Margin_Left = parseInt(getWid[0].CurrentData) * 24;
                                                    //SPAN ARROW CODE---------
                                                    if (parseInt(MarginTop) < 0) {
                                                        MarginTop = parseInt(MarginTop) * -1;
                                                    } if (parseInt(MarginTop) < 0) {
                                                        MarginTop = parseInt(MarginTop) * -1;
                                                    }
                                                    var SP = Predeccsors;
                                                    SP = SP.split(',');
                                                    var ColFlag = false;
                                                    for (var j = 0; j < SP.length; j++) {
                                                        if (SP[j] > rowCount) {
                                                            ColFlag = true;
                                                            break;
                                                        }
                                                    }
                                                    var largest = 0;
                                                    for (let i = 0; i < SP.length; i++) {
                                                        if (SP[i] > largest) {
                                                            largest = SP[i];
                                                        }
                                                    }
                                                    var JLeft = "";
                                                    JLeft = 7;
                                                    if (SP.length > 2 && largest < rowCount && ColFlag == true) {
                                                        if (RowFlag) {
                                                            JLeft = -7;
                                                            Margin_Left = parseInt(Margin_Left) + 15;
                                                        } else
                                                            Margin_Left = parseInt(Margin_Left);


                                                    } else {
                                                        if (!RowFlag && ColFlag) {
                                                            if (SP[SP.length - 1] < rowCount)
                                                                Margin_Left = parseInt(Margin_Left);
                                                            else
                                                                Margin_Left = parseInt(Margin_Left) + 15;
                                                        }
                                                        else {
                                                            if (ColFlag) {
                                                                JLeft = -7;
                                                                if (SP[SP.length - 1] < rowCount)
                                                                    Margin_Left = parseInt(Margin_Left);
                                                                else
                                                                    Margin_Left = parseInt(Margin_Left) + 15;
                                                            }
                                                        }
                                                    }
                                                    lineLst += '<span class="fn-label-line" style="height:' + Height + 'px !important;width: 1px;bottom:0px;top:-' + LMargin_top + 'px;margin-left: ' + LMargin_Left + 'px;"></span>'
                                                    widthLine += '<span style="margin-top: -' + MarginTop + 'px;width:' + Width + 'px;background: black;height: 1px;margin-left:-' + Margin_Left + 'px !important;float: left;"></span>'
                                                    spanDown += '<span class="fa fa-arrow-down" style="float: left;font-size: 9px;margin-left: ' + JLeft + 'px;color: black;margin-top: -25px;"></span>';
                                                    getWid = "";
                                                }

                                            }
                                        }
                                    }
                                    else {

                                        lineLst += '<span></span>'
                                        widthLine += '<span></span>'
                                    }
                                }

                            }
                        }
                    }
                    if (txtCounts != "") {
                        for (var i = 0; i < arrTextCount.length; i++) {
                            txtCounts = arrTextCount[i];
                            if (txtCounts > rowCount) {
                                if (StringType == "FF") {
                                    bar = $('<div class="bar">' + widthLines + '<div class="fn-label hiddenlabel hiddenlabels ">' + lineLst + label + '</div>' + spanDown + '' + widthLine + '</div>')

                                        .addClass(cls)
                                        .css({
                                            width: ((cellWidth * days) - barMarg) + 5
                                        })
                                        .data("dataObj", dataObj);
                                }


                                else {
                                    bar = $('<div class="bar">' + widthLines + '<div class="fn-label hiddenlabel hiddenlabels ">' + lineLst + label + '</div>' + spanDown + '' + widthLine + '</div>')

                                        .addClass(cls)
                                        .css({
                                            width: ((cellWidth * days) - barMarg) + 5
                                        })
                                        .data("dataObj", dataObj);
                                }
                            }
                            else {
                                bar = $('<div class="bar">' + widthLines + '<div class="fn-label hiddenlabel hiddenlabels">' + lineLst + label + '</div>' + widthLine + '' + spanDown + '</div>')

                                    .addClass(cls)
                                    .css({
                                        width: ((cellWidth * days) - barMarg) + 5
                                    })
                                    .data("dataObj", dataObj);
                            }
                        }
                    }
                }
                else {
                    var MDWidth = "";
                    if (desc == "")
                        MDWidth = 0;
                    else
                        MDWidth = ((cellWidth * days) - barMarg) + 5
                    var bar = $('<div class="bar"><div class="fn-label hiddenlabel hiddenlabels">' + label + '</div></div>')

                        .addClass(cls)
                        .css({
                            width: MDWidth
                        })
                        .data("dataObj", dataObj);
                }
                if (desc) {
                    bar.mouseover(function (e) {
                        var hint = $('<div class="fn-gantt-hint" />').html(desc);
                        $("body").append(hint);
                        hint.css("left", e.pageX);
                        hint.css("top", e.pageY);
                        hint.show();
                    })
                        .mouseout(function () {
                            $(".fn-gantt-hint").remove();
                        })
                        .mousemove(function (e) {
                            $(".fn-gantt-hint").css("left", e.pageX);
                            $(".fn-gantt-hint").css("top", e.pageY + 15);
                        });
                }
                bar.click(function (e) {
                    e.stopPropagation();
                    settings.onItemClick($(this).data("dataObj"));
                });

                return bar;
            },

            // Remove the `wd` (weekday) class and add `today` class to the
            // current day/week/month (depending on the current scale)
            markNow: function (element) {
                switch (settings.scale) {
                    case "weeks":
                        var cd = Date.parse(new Date());
                        cd = (Math.floor(cd / 36400000) * 36400000);
                        $(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                    case "months":
                        $(element).find(':findmonth("' + new Date().getTime() + '")').removeClass('wd').addClass('today');
                        break;
                    default:
                        var cd = Date.parse(new Date());
                        cd = (Math.floor(cd / 36400000) * 36400000);
                        $(element).find(':findday("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                }
            },

            // **Fill the Chart**
            // Parse the data and fill the data panel
            fillData: function (element, datapanel, leftpanel) {
                var invertColor = function (colStr) {
                    try {
                        colStr = colStr.replace("rgb(", "").replace(")", "");
                        var rgbArr = colStr.split(",");
                        var R = parseInt(rgbArr[0], 10);
                        var G = parseInt(rgbArr[1], 10);
                        var B = parseInt(rgbArr[2], 10);
                        var gray = Math.round((255 - (0.299 * R + 0.587 * G + 0.114 * B)) * 0.9, 1);
                        return "rgb(" + gray + ", " + gray + ", " + gray + ")";
                    } catch (err) {
                        return "";
                    }
                };
                // Loop through the values of each data element and set a row
                $.each(element.data, function (i, entry) {
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        $.each(entry.values, function (j, day) {
                            var _bar = null;
                            var _line = null;
                            switch (settings.scale) {
                                // **Hourly data**
                                case "hours":
                                    var dFrom = tools.genId(tools.dateDeserialize(day.from).getTime(), element.scaleStep);
                                    var from = $(element).find('#dh-' + dFrom);
                                    var dTo = tools.genId(tools.dateDeserialize(day.to).getTime(), element.scaleStep);
                                    var to = $(element).find('#dh-' + dTo);
                                    var cFrom = from.attr("offset");
                                    var cTo = to.attr("offset");
                                    var dl = Math.floor((cTo - cFrom) / tools.getCellSize()) + 1;
                                    var pFrom = tools.genId(tools.dateDeserialize(day.pfrom).getTime());
                                    var pTo = tools.genId(tools.dateDeserialize(day.pto).getTime());
                                    var ppfrom = $(element).find("#dh-" + pFrom);
                                    var pcFrom = ppfrom.attr("offset");
                                    var pl = Math.floor(((pTo / 1000) - (pFrom / 1000)) / 86400) + 1;
                                    if (!HideForm) {
                                        if (entry.shortEndDate == "")
                                            day.desc = ""
                                    } else {
                                        if (entry.endDate == "")
                                            day.desc = ""
                                    }
                                    _bar = core.createProgressBar(
                                        dl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );
                                    _line = core.createProgressBar(
                                        pl,
                                        //day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );
                                    // find row
                                    var topEl = $(element).find("#rowheader" + entry.rowCount);

                                    var top = tools.getCellSize() * 5 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'margin-top': top, 'margin-left': Math.floor(cFrom) });
                                    _line.css({ 'margin-top': top + 20, 'margin-left': Math.floor(pcFrom), 'height': '2px !important' });
                                    datapanel.append(_bar);
                                    if (entry.planBaseLine) {
                                        if (baselinebool == true) {
                                            _line[0].innerHTML = "";
                                            _line[0].className = _line[0].className + " set";
                                            datapanel.append(_line);
                                        }
                                    }
                                    break;

                                // **Weekly data**
                                case "weeks":
                                    var dtFrom = tools.dateDeserialize(day.from);
                                    var dtTo = tools.dateDeserialize(day.to);

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtTo.getDate() <= 3 && dtTo.getMonth() === 0) {
                                        dtTo.setDate(dtTo.getDate() + 4);
                                    }

                                    var from = $(element).find("#" + dtFrom.getWeekId());

                                    var cFrom = from.attr("offset");

                                    var to = $(element).find("#" + dtTo.getWeekId());
                                    var cTo = to.attr("offset");

                                    var dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

                                    var pFrom = tools.genId(tools.dateDeserialize(day.pfrom).getTime());
                                    var pTo = tools.genId(tools.dateDeserialize(day.pto).getTime());
                                    var ppfrom = $(element).find("#dh-" + pFrom);
                                    var pcFrom = ppfrom.attr("offset");
                                    var pl = Math.floor(((pTo / 1000) - (pFrom / 1000)) / 86400) + 1;

                                    _bar = core.createProgressBar(
                                        dl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );
                                    _line = core.createProgressBar(
                                        pl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );
                                    // find row
                                    var topEl = $(element).find("#rowheader" + entry.rowCount);

                                    var top = tools.getCellSize() * 3 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'margin-top': top, 'margin-left': Math.floor(cFrom) });
                                    //datapanel.append(_bar.clone().css({ 'margin-top': top + 20, 'height': '6px !important' }));
                                    _line.css({ 'margin-top': top + 20, 'margin-left': Math.floor(pcFrom), 'height': '2px !important' });
                                    datapanel.append(_bar);
                                    if (entry.planBaseLine) {
                                        if (baselinebool == true) {
                                            _line[0].innerHTML = "";
                                            _line[0].className = _line[0].className + " set";
                                            datapanel.append(_line);
                                        }
                                    }
                                    break;

                                // **Monthly data**
                                case "months":
                                    var dtFrom = tools.dateDeserialize(day.from);
                                    var dtTo = tools.dateDeserialize(day.to);

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtTo.getDate() <= 3 && dtTo.getMonth() === 0) {
                                        dtTo.setDate(dtTo.getDate() + 4);
                                    }

                                    var from = $(element).find("#dh-" + tools.genId(dtFrom.getTime()));
                                    var cFrom = from.attr("offset");
                                    var to = $(element).find("#dh-" + tools.genId(dtTo.getTime()));
                                    var cTo = to.attr("offset");
                                    var dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;


                                    var pFrom = tools.genId(tools.dateDeserialize(day.pfrom).getTime());
                                    var pTo = tools.genId(tools.dateDeserialize(day.pto).getTime());
                                    var ppfrom = $(element).find("#dh-" + pFrom);
                                    var pcFrom = ppfrom.attr("offset");
                                    var pl = Math.floor(((pTo / 1000) - (pFrom / 1000)) / 86400) + 1;

                                    _bar = core.createProgressBar(
                                        dl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );
                                    _line = core.createProgressBar(
                                        pl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );

                                    // find row
                                    var topEl = $(element).find("#rowheader" + entry.rowCount);

                                    var top = tools.getCellSize() * 2 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'margin-top': top, 'margin-left': Math.floor(cFrom) });
                                    _line.css({ 'margin-top': top + 20, 'margin-left': Math.floor(pcFrom), 'height': '2px !important' });
                                    datapanel.append(_bar);
                                    if (entry.planBaseLine) {
                                        if (baselinebool == true) {
                                            _line[0].innerHTML = "";
                                            _line[0].className = _line[0].className + " set";
                                            datapanel.append(_line);
                                        }
                                    }
                                    break;

                                // **Days**
                                default:
                                    var dFrom = tools.genId(tools.dateDeserialize(day.from).getTime());
                                    var dTo = tools.genId(tools.dateDeserialize(day.to).getTime());
                                    var from = $(element).find("#dh-" + dFrom);
                                    var cFrom = from.attr("offset");
                                    var dl = Math.floor(((dTo / 1000) - (dFrom / 1000)) / 86400) + 1;
                                    var pFrom = tools.genId(tools.dateDeserialize(day.pfrom).getTime());
                                    var pTo = tools.genId(tools.dateDeserialize(day.pto).getTime());
                                    var ppfrom = $(element).find("#dh-" + pFrom);
                                    var pcFrom = ppfrom.attr("offset");
                                    var pl = Math.floor(((pTo / 1000) - (pFrom / 1000)) / 86400) + 1;
                                    if (!HideForm) {
                                        if (entry.shortEndDate == "")
                                            day.desc = ""
                                    } else {
                                        if (entry.endDate == "")
                                            day.desc = ""
                                    }
                                    _bar = core.createProgressBar(
                                        dl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );
                                    _line = core.createProgressBar(
                                        pl,
                                        day.customClass ? day.customClass : "",
                                        day.desc ? day.desc : "",
                                        day.label ? day.label : "",
                                        day.dataObj ? day.dataObj : day.dataObj,
                                        entry.predecessors ? entry.predecessors : "",
                                        entry.rowCount
                                    );

                                    // find row
                                    var topEl = $(element).find("#rowheader" + entry.rowCount);

                                    var top = tools.getCellSize() * 4 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'margin-top': top, 'margin-left': Math.floor(cFrom) });
                                    _line.css({ 'margin-top': top + 20, 'margin-left': Math.floor(pcFrom), 'height': '2px !important' });
                                    datapanel.append(_bar);
                                    if (entry.planBaseLine) {
                                        if (baselinebool == true) {
                                            _line[0].innerHTML = "";
                                            _line[0].className = _line[0].className + " set";
                                            datapanel.append(_line);
                                        }
                                    }
                                    //datapanel.append(_bar.clone().css({ 'margin-top': top+20,'height':'6px !important' }));
                                    break;
                            }
                            var $l = _bar.find(".fn-label");
                            if ($l && _bar.length) {
                                var gray = invertColor(_bar[0].style.backgroundColor);
                                $l.css("color", gray);
                            } else if ($l) {
                                $l.css("color", "");
                            }
                        });
                        if (entry.subTask.length > 0)
                            core.fillSubTask(entry.subTask, element, datapanel);
                    }
                });
            },

            fillSubTask: function (subentry, element, datapanel) {
                var invertColor = function (colStr) {
                    try {
                        colStr = colStr.replace("rgb(", "").replace(")", "");
                        var rgbArr = colStr.split(",");
                        var R = parseInt(rgbArr[0], 10);
                        var G = parseInt(rgbArr[1], 10);
                        var B = parseInt(rgbArr[2], 10);
                        var gray = Math.round((255 - (0.299 * R + 0.587 * G + 0.114 * B)) * 0.9, 1);
                        return "rgb(" + gray + ", " + gray + ", " + gray + ")";
                    } catch (err) {
                        return "";
                    }
                };

                $.each(subentry, function (i, entry) {
                    $.each(entry.values, function (j, day) {
                        var _bar = null;
                        var _line = null;
                        var dFrom = tools.genId(tools.dateDeserialize(day.from).getTime());
                        var dTo = tools.genId(tools.dateDeserialize(day.to).getTime());
                        var from = $(element).find("#dh-" + dFrom);
                        var cFrom = from.attr("offset");
                        var pFrom = tools.genId(tools.dateDeserialize(day.pfrom).getTime());
                        var pTo = tools.genId(tools.dateDeserialize(day.pto).getTime());
                        var ppfrom = $(element).find("#dh-" + pFrom);
                        var pcFrom = ppfrom.attr("offset");
                        var pl = Math.floor(((pTo / 1000) - (pFrom / 1000)) / 86400) + 1;
                        var dl = Math.floor(((dTo / 1000) - (dFrom / 1000)) / 86400) + 1;
                        if (!HideForm) {
                            if (entry.shortEndDate == "")
                                day.desc = ""
                        } else {
                            if (entry.endDate == "")
                                day.desc = ""
                        }
                        _bar = core.createProgressBar(
                            dl,
                            day.customClass ? day.customClass : "",
                            day.desc ? day.desc : "",
                            day.label ? day.label : "",
                            day.dataObj ? day.dataObj : day.dataObj,
                            entry.predecessors ? entry.predecessors : "",
                            entry.rowCount
                        );
                        _line = core.createProgressBar(
                            pl,
                            day.customClass ? day.customClass : "",
                            day.desc ? day.desc : "",
                            day.label ? day.label : "",
                            day.dataObj ? day.dataObj : day.dataObj,
                            entry.predecessors ? entry.predecessors : "",
                            entry.rowCount
                        );
                        // find row
                        var topEl = $(element).find("#rowheader" + entry.rowCount);
                        var top = tools.getCellSize() * 4 + 2 + parseInt(topEl.attr("offset"), 10);
                        _bar.css({ 'margin-top': top, 'margin-left': Math.floor(cFrom) });
                        datapanel.append(_bar);
                        _line.css({ 'margin-top': top + 20, 'margin-left': Math.floor(pcFrom), 'height': '2px !important' });
                        //datapanel.append(_bar.cloneFcrea().css({ 'margin-top': top+20,'height':'6px !important' }));
                        if (entry.planBaseLine) {
                            if (baselinebool == true) {
                                _line[0].innerHTML = "";
                                _line[0].className = _line[0].className + " set";
                                datapanel.append(_line);
                            }
                        }
                        var $l = _bar.find(".fn-label");
                        if ($l && _bar.length) {
                            var gray = invertColor(_bar[0].style.backgroundColor);
                            $l.css("color", gray);
                        } else if ($l) {
                            $l.css("color", "");
                        }
                        if (entry.subTask.length > 0)
                            core.fillSubTask(entry.subTask, element, datapanel);
                    });

                });
            },
            // **Navigation**
            navigateTo: function (element, val) {
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                $dataPanel.click = function () {
                    alert(arguments.join(""));
                };
                var rightPanelWidth = $rightPanel.width();
                var dataPanelWidth = $dataPanel.width();

                switch (val) {
                    case "begin":
                        $dataPanel.animate({
                            "margin-left": "0px"
                        }, "fast", function () { core.repositionLabel(element); });
                        element.scrollNavigation.panelMargin = 0;
                        break;
                    case "end":
                        var mLeft = dataPanelWidth - rightPanelWidth;
                        element.scrollNavigation.panelMargin = mLeft * -1;
                        $dataPanel.animate({
                            "margin-left": "-" + mLeft + "px"
                        }, "fast", function () { core.repositionLabel(element); });
                        break;
                    case "now":
                        if (!element.scrollNavigation.canScroll || !$dataPanel.find(".today").length) {
                            return false;
                        }
                        var max_left = (dataPanelWidth - rightPanelWidth) * -1;
                        var cur_marg = $dataPanel.css("margin-left").replace("px", "");
                        var val = $dataPanel.find(".today").offset().left - $dataPanel.offset().left;
                        val *= -1;
                        if (val > 0) {
                            val = 0;
                        } else if (val < max_left) {
                            val = max_left;
                        }
                        $dataPanel.animate({
                            "margin-left": val + "px"
                        }, "fast", core.repositionLabel(element));
                        element.scrollNavigation.panelMargin = val;
                        break;
                    default:
                        var max_left = (dataPanelWidth - rightPanelWidth) * -1;
                        var cur_marg = $dataPanel.css("margin-left").replace("px", "");
                        var val = parseInt(cur_marg, 10) + val;
                        if (val <= 0 && val >= max_left) {
                            $dataPanel.animate({
                                "margin-left": val + "px"
                            }, "fast", core.repositionLabel(element));
                        }
                        element.scrollNavigation.panelMargin = val;
                        break;
                }
            },

            // Navigate to a specific page
            navigatePage: function (element, val) {
                if ((element.pageNum + val) >= 0 && (element.pageNum + val) < Math.ceil(element.rowsNum / settings.itemsPerPage)) {
                    core.waitToggle(element, true, function () {
                        element.pageNum += val;
                        element.hPosition = $(".fn-gantt .dataPanel").css("margin-left").replace("px", "");
                        element.scaleOldWidth = false;
                        core.init(element);
                    });
                }
            },

            // Change zoom level
            zoomInOut: function (element, val) {
                core.waitToggle(element, true, function () {
                    var zoomIn = (val < 0);
                    var scaleSt = element.scaleStep + val * 3;
                    scaleSt = scaleSt <= 1 ? 1 : scaleSt === 4 ? 3 : scaleSt;
                    var scale = settings.scale;
                    var headerRows = element.headerRows;
                    if (settings.scale === "hours" && scaleSt >= 13) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "days" && zoomIn) {
                        scale = "hours";
                        headerRows = 5;
                        scaleSt = 12;
                    } else if (settings.scale === "days" && !zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    } else if (settings.scale === "weeks" && !zoomIn) {
                        scale = "months";
                        headerRows = 2;
                        scaleSt = 14;
                    } else if (settings.scale === "weeks" && zoomIn) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "months" && zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    }

                    if ((zoomIn && $.inArray(scale, scales) < $.inArray(settings.minScale, scales))
                        || (!zoomIn && $.inArray(scale, scales) > $.inArray(settings.maxScale, scales))) {
                        core.init(element);
                        return;
                    }
                    element.scaleStep = scaleSt;
                    settings.scale = scale;
                    element.headerRows = headerRows;
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    element.hPosition = $dataPanel.css("margin-left").replace("px", "");
                    element.scaleOldWidth = ($dataPanel.width() - $rightPanel.width());

                    if (settings.useCookie) {
                        $.cookie(this.cookieKey + "CurrentScale", settings.scale);
                        // reset scrollPos
                        $.cookie(this.cookieKey + "ScrollPos", null);
                    }
                    core.init(element);
                });
            },

            // Move chart via mouseclick
            mouseScroll: function (element, e) {
                var $dataPanel = $(element).find(".fn-gantt .dataPanel");
                $dataPanel.css("cursor", "move");
                var bPos = $dataPanel.offset();
                var mPos = element.scrollNavigation.mouseX === null ? e.pageX : element.scrollNavigation.mouseX;
                var delta = e.pageX - mPos;
                element.scrollNavigation.mouseX = e.pageX;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via mousewheel
            wheelScroll: function (element, e) {
                //var delta = e.detail ? e.detail * (-50) : e.wheelDelta / 120 * 50;

                //core.scrollPanel(element, delta);

                //clearTimeout(element.scrollNavigation.repositionDelay);
                //element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);

                //if (e.preventDefault) {
                //    e.preventDefault();
                //} else {
                //    return false;
                //}
            },

            // Move chart via slider control
            sliderScroll: function (element, e) {
                //var $sliderBar = $(element).find(".nav-slider-bar");
                //var $sliderBarBtn = $sliderBar.find(".nav-slider-button");
                //var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                //var $dataPanel = $rightPanel.find(".dataPanel");
                //var bPos = $sliderBar.offset();
                //var bWidth = $sliderBar.width();
                //var wButton = $sliderBarBtn.width();

                //var pos, mLeft;

                //if ((e.pageX >= bPos.left) && (e.pageX <= bPos.left + bWidth)) {
                //    pos = e.pageX - bPos.left;
                //    pos = pos - wButton / 2;
                //    $sliderBarBtn.css("left", pos);

                //    mLeft = $dataPanel.width() - $rightPanel.width();

                //    var pPos = pos * mLeft / bWidth * -1;
                //    if (pPos >= 0) {
                //        $dataPanel.css("margin-left", "0px");
                //        element.scrollNavigation.panelMargin = 0;
                //    } else if (pos >= bWidth - (wButton * 1)) {
                //        $dataPanel.css("margin-left", mLeft * -1 + "px");
                //        element.scrollNavigation.panelMargin = mLeft * -1;
                //    } else {
                //        $dataPanel.css("margin-left", pPos + "px");
                //        element.scrollNavigation.panelMargin = pPos;
                //    }
                //    clearTimeout(element.scrollNavigation.repositionDelay);
                //    element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 5, element);
                //}
            },

            // Update scroll panel margins
            scrollPanel: function (element, delta) {
                //if (!element.scrollNavigation.canScroll) {
                //    return false;
                //}
                //var _panelMargin = parseInt(element.scrollNavigation.panelMargin, 10) + delta;
                //if (_panelMargin > 0) {
                //    element.scrollNavigation.panelMargin = 0;
                //    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                //} else if (_panelMargin < element.scrollNavigation.panelMaxPos * -1) {
                //    element.scrollNavigation.panelMargin = element.scrollNavigation.panelMaxPos * -1;
                //    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                //} else {
                //    element.scrollNavigation.panelMargin = _panelMargin;
                //    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                //}
                //core.synchronizeScroller(element);
            },

            // Synchronize scroller
            synchronizeScroller: function (element) {
                if (settings.navigate === "scroll") {
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    var $sliderBar = $(element).find(".nav-slider-bar");
                    var $sliderBtn = $sliderBar.find(".nav-slider-button");

                    var bWidth = $sliderBar.width();
                    var wButton = $sliderBtn.width();

                    var mLeft = $dataPanel.width() - $rightPanel.width();
                    var hPos = 0;
                    if ($dataPanel.css("margin-left")) {
                        hPos = $dataPanel.css("margin-left").replace("px", "");
                    }
                    var pos = hPos * bWidth / mLeft - $sliderBtn.width() * 0.25;
                    pos = pos > 0 ? 0 : (pos * -1 >= bWidth - (wButton * 0.75)) ? (bWidth - (wButton * 1.25)) * -1 : pos;
                    $sliderBtn.css("left", pos * -1);
                }
            },

            // Reposition data labels
            repositionLabel: function (element) {


                var position = "0";

                var position = $(".rightPanel").scrollTop();

                $(".rightPanel").scroll(function () {

                    var scroll = $(".rightPanel").scrollTop();


                    if (scroll > position) {

                    } else {

                    }

                    $(".leftPanel").scrollTop(position = scroll);

                });

                setTimeout(function () {
                    var $dataPanel;
                    if (!element) {

                        $dataPanel = $(".fn-gantt .rightPanel .dataPanel");
                    } else {
                        var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                        $dataPanel = $rightPanel.find(".dataPanel");
                    }

                    if (settings.useCookie) {
                        $.cookie(this.cookieKey + "ScrollPos", $dataPanel.css("margin-left").replace("px", ""));
                    }
                }, 500);
            },

            // waitToggle
            waitToggle: function (element, show, fn) {
                if (show) {
                    var eo = $(element).offset();
                    var ew = $(element).outerWidth();
                    var eh = $(element).outerHeight();

                    if (!element.loader) {
                        element.loader = $('<div class="fn-gantt-loader" style="position: absolute; top: ' + eo.top + 'px; left: ' + eo.left + 'px; width: ' + ew + 'px; height: ' + eh + 'px;">'
                            + '<div class="fn-gantt-loader-spinner"><span>' + settings.waitText + '</span></div></div>');
                    }
                    $("body").append(element.loader);
                    setTimeout(fn, 100);

                } else {
                    if (element.loader) {
                        element.loader.remove();
                    }
                    element.loader = null;
                }
            }
        };

        // Utility functions
        // =================
        var tools = {

            // Return the maximum available date in data depending on the scale
            getMaxDate: function (element) {
                var maxDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, date) {
                        maxDate = maxDate < tools.dateDeserialize(date.to) ? tools.dateDeserialize(date.to) : maxDate;
                    });
                });
                if (maxDate != null) {
                    switch (settings.scale) {
                        case "hours":
                            maxDate.setHours(Math.ceil((maxDate.getHours()) / element.scaleStep) * element.scaleStep);
                            maxDate.setHours(maxDate.getHours() + element.scaleStep * 3);
                            break;
                        case "weeks":
                            var bd = new Date(maxDate.getTime());
                            var bd = new Date(bd.setDate(bd.getDate() + 3 * 7));
                            var md = Math.floor(bd.getDate() / 7) * 7;
                            maxDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                            break;
                        case "months":
                            var bd = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                            bd.setMonth(bd.getMonth() + 2);
                            maxDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                            break;
                        default:
                            maxDate.setHours(0);
                            maxDate.setDate(maxDate.getDate() + 3);
                            break;
                    }
                }
                return maxDate;
            },

            // Return the minimum available date in data depending on the scale
            getMinDate: function (element) {
                var minDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, date) {
                        minDate = minDate > tools.dateDeserialize(date.from) || minDate === null ? tools.dateDeserialize(date.from) : minDate;
                    });
                });
                if (minDate != null) {
                    switch (settings.scale) {
                        case "hours":
                            minDate.setHours(Math.floor((minDate.getHours()) / element.scaleStep) * element.scaleStep);
                            minDate.setHours(minDate.getHours() - element.scaleStep * 3);
                            break;
                        case "weeks":
                            var bd = new Date(minDate.getTime());
                            var bd = new Date(bd.setDate(bd.getDate() - 3 * 7));
                            var md = Math.floor(bd.getDate() / 7) * 7;
                            minDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                            break;
                        case "months":
                            var bd = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                            bd.setMonth(bd.getMonth() - 3);
                            minDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                            break;
                        default:
                            minDate.setHours(0);
                            minDate.setDate(minDate.getDate() - 3);
                            break;
                    }
                }
                return minDate;
            },

            // Return an array of Date objects between `from` and `to`
            parseDateRange: function (from, to) {
                var current = new Date(from.getTime());
                var end = new Date(to.getTime());
                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getTime());
                    current.setDate(current.getDate() + 1);
                } while (current.getTime() <= to.getTime());
                return ret;

            },

            // Return an array of Date objects between `from` and `to`,
            // scaled hourly
            parseTimeRange: function (from, to, scaleStep) {
                var current = new Date(from);
                var end = new Date(to);
                var ret = [];
                var i = 0;
                do {
                    ret[i] = new Date(current.getTime());
                    current.setHours(current.getHours() + scaleStep);
                    current.setHours(Math.floor((current.getHours()) / scaleStep) * scaleStep);

                    if (current.getDay() !== ret[i].getDay()) {
                        current.setHours(0);
                    }
                    i++;
                } while (current.getTime() <= to.getTime());
                return ret;
            },

            // Return an array of Date objects between a range of weeks
            // between `from` and `to`
            parseWeeksRange: function (from, to) {

                var current = new Date(from);
                var end = new Date(to);

                var ret = [];
                var i = 0;
                do {
                    if (current.getDay() === 0) {
                        ret[i++] = current.getDayForWeek();
                    }
                    current.setDate(current.getDate() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },


            // Return an array of Date objects between a range of months
            // between `from` and `to`
            parseMonthsRange: function (from, to) {

                var current = new Date(from);
                var end = new Date(to);

                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getFullYear(), current.getMonth(), 1);
                    current.setMonth(current.getMonth() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },

            // Deserialize a date from a string
            dateDeserialize: function (dateStr) {
                //return eval("new" + dateStr.replace(/\//g, " "));
                var date = eval("new" + dateStr.replace(/\//g, " "));
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
            },

            // Generate an id for a date
            genId: function (ticks) {
                var t = new Date(ticks);
                switch (settings.scale) {
                    case "hours":
                        var hour = t.getHours();
                        if (arguments.length >= 2) {
                            hour = (Math.floor((t.getHours()) / arguments[1]) * arguments[1]);
                        }
                        return (new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour)).getTime();
                    case "weeks":
                        var y = t.getFullYear();
                        var w = t.getDayForWeek().getWeekOfYear();
                        var m = t.getMonth();
                        if (m === 11 && w === 1) {
                            y++;
                        }
                        return y + "-" + w;
                    case "months":
                        return t.getFullYear() + "-" + t.getMonth();
                    default:
                        return (new Date(t.getFullYear(), t.getMonth(), t.getDate())).getTime();
                }
            },

            // Get the current cell size
            _getCellSize: null,
            getCellSize: function () {
                if (!tools._getCellSize) {
                    $("body").append(
                        $('<div style="display: none; position: absolute;" class="fn-gantt" id="measureCellWidth"><div class="row"></div></div>')
                    );
                    tools._getCellSize = $("#measureCellWidth .row").height();
                    $("#measureCellWidth").empty().remove();
                }
                return tools._getCellSize;
            },

            // Get the current size of the rigth panel
            getRightPanelSize: function () {
                $("body").append(
                    $('<div style="display: none; position: absolute;" class="fn-gantt" id="measureCellWidth"><div class="rightPanel"></div></div>')
                );
                var ret = $("#measureCellWidth .rightPanel").height();
                $("#measureCellWidth").empty().remove();
                return ret;
            },

            // Get the current page height
            getPageHeight: function (element) {
                return element.pageNum + 1 === element.pageCount ? element.rowsOnLastPage * tools.getCellSize() : settings.itemsPerPage * tools.getCellSize();
            },

            // Get the current margin size of the progress bar
            _getProgressBarMargin: null,
            getProgressBarMargin: function () {
                if (!tools._getProgressBarMargin) {
                    $("body").append(
                        $('<div style="display: none; position: absolute;" id="measureBarWidth"><div class="fn-gantt"><div class="rightPanel"><div class="dataPanel"><div class="row day"><div class="bar" /></div></div></div></div></div>')
                    );
                    tools._getProgressBarMargin = parseInt($("#measureBarWidth .fn-gantt .rightPanel .day .bar").css("margin-left").replace("px", ""), 10);
                    tools._getProgressBarMargin += parseInt($("#measureBarWidth .fn-gantt .rightPanel .day .bar").css("margin-right").replace("px", ""), 10);
                    $("#measureBarWidth").empty().remove();
                }
                return tools._getProgressBarMargin;
            }
        };

        this.each(function () {
            /**
            * Extend options with default values
            */
            if (options) {
                $.extend(settings, options);
            }

            this.data = null;        // Received data
            this.pageNum = 0;        // Current page number
            this.pageCount = 0;      // Available pages count
            this.rowsOnLastPage = 0; // How many rows on last page
            this.rowsNum = 0;        // Number of total rows
            this.hPosition = 0;      // Current position on diagram (Horizontal)
            this.dateStart = null;
            this.dateEnd = null;
            this.scrollClicked = false;
            this.scaleOldWidth = null;
            this.headerRows = null;
            // Update cookie with current scale
            if (settings.useCookie) {
                var sc = $.cookie(this.cookieKey + "CurrentScale");
                if (sc) {
                    settings.scale = $.cookie(this.cookieKey + "CurrentScale");
                } else {
                    $.cookie(this.cookieKey + "CurrentScale", settings.scale);
                }
            }
            switch (settings.scale) {
                case "hours": this.headerRows = 5; this.scaleStep = 1; break;
                case "weeks": this.headerRows = 3; this.scaleStep = 13; break;
                case "months": this.headerRows = 2; this.scaleStep = 14; break;
                default: this.headerRows = 4; this.scaleStep = 13; break;
            }

            this.scrollNavigation = {
                panelMouseDown: false,
                scrollerMouseDown: false,
                mouseX: null,
                panelMargin: 0,
                repositionDelay: 0,
                panelMaxPos: 0,
                canScroll: true
            };

            this.gantt = null;
            this.loader = null;
            core.create(this);

        });

        //var position = $(".rightPanel").scrollTop();
        //$(".rightPanel").scroll(function () {
        //    var scroll = $(".rightPanel").scrollTop();
        //    if (scroll > position) {
        //        alert("check");
        //    } else {
        //        alert("recheck");
        //    }
        //    $(".leftPanel").scrollTop(position = scroll);
        //});



    };
})(jQuery);
function RemoveSubTask(parentId, rowCount) {

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        if (arrayGantt[selectedIndex].id == parentId) {
            if (arrayGantt[selectedIndex].subTask.length > 0)
                var selected = arrayGantt[selectedIndex].subTask.findIndex(element => element.rowCount == rowCount);

            if (selected >= 0) {
                var selected = arrayGantt[selectedIndex].subTask.findIndex(element => element.rowCount == rowCount);

                if (arrayGantt[selectedIndex].subTask[selected].id != 0) {
                    var obj = new Object();
                    obj = arrayGantt[selectedIndex].subTask[selected].id;
                    swal({
                        title: "Are you sure?",
                        text: "Do you really Want to delete the Row",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                        .then((willDelete) => {
                            if (willDelete) {
                                DeleteRows(obj);
                                arrayGantt[selectedIndex].subTask.splice(selected, 1);
                                LoadChart();
                            }
                        });

                }

                break;
            } else {
                arrayGantt[selectedIndex].subTask = RemoveSub(arrayGantt[selectedIndex].subTask, parentId, rowCount);
            }
        }
        else {
            arrayGantt[selectedIndex].subTask = RemoveSubTree(arrayGantt[selectedIndex].subTask, parentId, rowCount);
        }
    }

    // LoadChart();
}
function RemoveSub(arr, parentId, rowCount) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rowCount == rowCount) {
                var selectedIndex = arr.findIndex(element => element.rowCount == rowCount);
                if (arr[i].id != 0) {
                    var obj = new Object();
                    obj = arr[i].id;
                    swal({
                        title: "Are you sure?",
                        text: "Do you really Want to delete the Row",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                        .then((willDelete) => {
                            if (willDelete) {
                                DeleteRows(obj);
                                arr[i].subTask.splice(selectedIndex, 1);
                                LoadChart();
                            }
                        });
                }

                break;
            } else {
                arr[i].subTask = RemoveSubTree(arr[i].subTask, parentId, rowCount);
            }
        }
    }
    return arr;
}
function RemoveSubTree(arr, parentId, rowCount) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {

            if (arr[i].id == parentId) {
                var selectedIndex = arr[i].subTask.findIndex(element => element.rowCount == rowCount);
                if (arr[i].id != 0) {
                    var obj = new Object();
                    obj = arr[i].id;
                    swal({
                        title: "Are you sure?",
                        text: "Do you really Want to delete the Row",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                        .then((willDelete) => {
                            if (willDelete) {
                                DeleteRows(obj);
                                arr[i].subTask.splice(selectedIndex, 1);
                                LoadChart();
                            }
                        });
                }

                break;
            } else {
                arr[i].subTask = RemoveSubTree(arr[i].subTask, parentId, rowCount);
            }
        }
    }
    return arr;
}
// PREDECSSOR BASELINE CALCULATION ********************START*****************
function getWidthGantt(txtcount, crntCount, StringType, Flag) {
    DayBaseline = [];
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        getWidthGanttSubtree(arrayGantt[selectedIndex].subTask, txtcount, crntCount, StringType, Flag);
    }
    return DayBaseline;
}
function getWidthGanttSubtree(arr, txtCount, crntCount, StringType, Flag) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rowCount == txtCount) {
                if (Flag) {
                    txtlasdate = arr[i].endDate;
                    txtFirstDates = arr[i].startDate;
                } else {
                    txtlasdate = arr[i].shortEndDate;
                    txtFirstDates = arr[i].shortStartDate;
                }
                break;
            }
            arr[i].subTask = getWidthGanttSubtree(arr[i].subTask, txtCount, crntCount, StringType, Flag);
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rowCount == crntCount) {
                if (StringType == "FS") {
                    var crntDate = "";
                    var entDay = "";
                    if (Flag) {
                        crntDate = arr[i].startDate;
                        entDay = arr[i].endDate;
                    }
                    else {
                        crntDate = arr[i].shortStartDate;
                        entDay = arr[i].shortEndDate;
                    }
                    startDate = new Date(splitSlash(crntDate));
                    endDate = new Date(splitSlash(entDay));
                    if (startDate <= endDate) {
                        var siblingStartDate = new Date(splitSlash(txtFirstDates));
                        var siblingEndDate = new Date(splitSlash(txtlasdate));
                        var diff = new Date(siblingEndDate - startDate);
                        daysPush = diff / 1000 / 60 / 60 / 24;
                        var PredecDay = new Date(siblingEndDate - endDate);
                        PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                        var JoinDay = new Date(siblingEndDate - startDate);
                        JoinDay = JoinDay / 1000 / 60 / 60 / 24;
                        var NegativeFlag = false;
                        if (startDate < siblingEndDate)
                            NegativeFlag = true;
                        var Obj =
                        {
                            CurrentData: daysPush,
                            siblingData: PredicDays,
                            JoinData: JoinDay,
                            Flag: NegativeFlag
                        };
                        DayBaseline.push(Obj);
                        break;
                    }
                }
                else if (StringType == "FF") {
                    var StartDate = "";
                    var EndDate = "";
                    if (Flag) {
                        StartDate = new Date(splitSlash(arr[i].startDate));
                        EndDate = new Date(splitSlash(arr[i].endDate));
                    } else {
                        StartDate = new Date(splitSlash(arr[i].shortStartDate));
                        EndDate = new Date(splitSlash(arr[i].shortEndDate));
                    }
                    var SibilingEndate = new Date(splitSlash(txtlasdate));
                    var CurrentDays = new Date(EndDate - StartDate);
                    var PredecDay = new Date(SibilingEndate - EndDate);
                    var JoinDay = new Date(SibilingEndate - StartDate);
                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var JoinDayS = JoinDay / 1000 / 60 / 60 / 24;
                    var NegativeFlag = false;
                    var SecondaryFlag = false;
                    if (StartDate < SibilingEndate)
                        NegativeFlag = true;
                    if (EndDate < SibilingEndate)
                        SecondaryFlag = true;
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        JoinData: JoinDayS,
                        Flag: NegativeFlag,
                        secondary: SecondaryFlag

                    };
                    DayBaseline.push(Obj);
                    break;
                }
                else if (StringType == "SS") {
                    var StartDate = "";
                    var EndDate = "";
                    if (Flag) {
                        StartDate = new Date(splitSlash(arr[i].startDate));
                        EndDate = new Date(splitSlash(arr[i].endDate));
                    } else {
                        StartDate = new Date(splitSlash(arr[i].shortStartDate));
                        EndDate = new Date(splitSlash(arr[i].shortEndDate));
                    }
                    var SibilingEndate = new Date(splitSlash(txtlasdate));
                    var SibilingStartDate = new Date(splitSlash(txtFirstDates));
                    var CurrentDays = new Date(EndDate - StartDate);
                    var PredecDay = new Date(SibilingStartDate - StartDate);
                    var JoinDay = new Date(SibilingStartDate - StartDate);
                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var JDays = JoinDay / 1000 / 60 / 60 / 24;
                    var Flag = false;
                    if (SibilingStartDate > StartDate) {
                        Flag = true;
                    }
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        JoinData: JDays,
                        Boolean: Flag

                    };
                    DayBaseline.push(Obj);
                    break;


                }
                else if (StringType == "SF") {
                    var StartDate = "";
                    var EndDate = "";
                    if (Flag) {
                        StartDate = new Date(splitSlash(arr[i].startDate));
                        EndDate = new Date(splitSlash(arr[i].endDate));
                    }
                    else {
                        StartDate = new Date(splitSlash(arr[i].shortStartDate));
                        EndDate = new Date(splitSlash(arr[i].shortEndDate));
                    }
                    var SibilingEndate = new Date(splitSlash(txtlasdate));
                    var SibilingStartDate = new Date(splitSlash(txtFirstDates));
                    var CurrentDays = new Date(EndDate - StartDate);
                    var PredecDay = new Date(SibilingStartDate - EndDate);
                    var JoinDay = new Date(SibilingStartDate - StartDate);
                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var JDays = JoinDay / 1000 / 60 / 60 / 24;
                    var Flag = false;
                    var SecondaryFlags = false;
                    if (SibilingStartDate < StartDate) {
                        Flag = true;
                    } else {
                        Flag = false;
                    } if (EndDate < SibilingStartDate) {
                        SecondaryFlags = true;
                    } else {
                        SecondaryFlags = false;
                    }
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        JoinData: JDays,
                        Boolean: Flag,
                        SecondaryFlag: SecondaryFlags
                    };
                    DayBaseline.push(Obj);
                    break;
                }
                else {
                    var crntDate = "";
                    var entDate = "";
                    if (Flag) {
                        crntDate = arr[i].startDate
                            ;
                        entDate = arr[i].endDate;
                    } else {
                        crntDate = arr[i].shortStartDate;
                        entDate = arr[i].shortEndDate;
                    }
                    var SDate = new Date(splitSlash(crntDate));
                    var RDate = new Date(splitSlash(entDate));
                    var LDate = new Date(splitSlash(txtlasdate));
                    if (SDate <= RDate) {
                        var last = splitSlash(txtlasdate);
                        var startDate = splitSlash(crntDate);
                        var endCal = new Date(last);
                        var startCal = new Date(startDate);
                        var diff = new Date(endCal - startCal);
                        daysPush = diff / 1000 / 60 / 60 / 24;
                        var PredecDay = new Date(endCal - RDate);
                        PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                        var Obj =
                        {
                            CurrentData: daysPush,
                            siblingData: PredicDays

                        };
                        DayBaseline.push(Obj);
                        break;
                    }
                }
                arr[i].subTask = getWidthGanttSubtree(arr[i].subTask, txtCount, crntCount, StringType, Flag);
            }
        }
    }
    return arr;
}
function splitSlash(date) {
    var e = date.split('-');
    var d = e[1] + '-' + e[0] + '-' + e[2];
    return d;
}
function getWidthEndGantt(txtcount, crntCount, StringType, Flag) {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        getWidthEndGanttSubtree(arrayGantt[selectedIndex].subTask, txtcount, crntCount, StringType, Flag);
    }
    return DayBaseline;
}
var txtFirstDates = "";
function getWidthEndGanttSubtree(arr, txtCount, crntCount, StringType, Flag) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rowCount == txtCount) {
                if (Flag) {
                    txtlasdates = arr[i].endDate;
                    txtFirstDates = arr[i].startDate;
                } else {
                    txtlasdates = arr[i].shortEndDate;
                    txtFirstDates = arr[i].shortStartDate;
                }
                break;
            }
            arr[i].subTask = getWidthEndGanttSubtree(arr[i].subTask, txtCount, crntCount, StringType, Flag);
        }
        for (var i = 0; i < arr.length; i++) {

            if (arr[i].rowCount == crntCount) {
                if (StringType == "FS") {
                    DayBaseline = [];
                    var EndDate = "";
                    var startdate = "";
                    if (Flag) {
                        EndDate = arr[i].endDate;
                        startdate = arr[i].startDate;
                    } else {
                        EndDate = arr[i].shortEndDate;
                        startdate = arr[i].shortStartDate;
                    }
                    var SibilingEndate = splitSlash(txtlasdates);
                    SibilingEndate = new Date(splitSlash(txtlasdates));
                    EndDate = new Date(splitSlash(EndDate));
                    startdate = new Date(splitSlash(startdate));
                    var CurrentDays = new Date(startdate - EndDate);
                    var PredecDay = new Date(SibilingEndate - startdate);
                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var SubFlag = false;
                    if (startdate < SibilingEndate)
                        SubFlag = true;
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        Flag: SubFlag
                    };
                    DayBaseline.push(Obj);
                    break;
                }
                else if (StringType == "FF") {
                    DayBaseline = [];
                    var EndDate = "";
                    var startdate = "";
                    if (Flag) {
                        EndDate = arr[i].endDate;
                        startdate = arr[i].startDate;
                    } else {
                        EndDate = arr[i].shortEndDate;
                        startdate = arr[i].shortStartDate;
                    }
                    var SibilingEndate = splitSlash(txtlasdates);
                    SibilingEndate = new Date(splitSlash(txtlasdates));
                    var SiblingStartDate = new Date(splitSlash(txtlasdates));
                    EndDate = new Date(splitSlash(EndDate));
                    startdate = new Date(splitSlash(startdate));
                    var CurrentDays = new Date(startdate - EndDate);
                    var PredecDay = new Date(SibilingEndate - EndDate);
                    var JoinDay = new Date(SibilingEndate - startdate);
                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var JDays = JoinDay / 1000 / 60 / 60 / 24;
                    var Flag = false;
                    if (startdate < SiblingStartDate)
                        Flag = true;
                    else if (SibilingEndate > EndDate) {
                        Flag = true;
                    }
                    var SubFlag = false;
                    if (EndDate < SibilingEndate)
                        SubFlag = true;
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        JoinData: JDays,
                        Boolean: Flag,
                        Flags: SubFlag
                    };
                    DayBaseline.push(Obj);
                    break;

                }
                else if (StringType == "SS") {
                    DayBaseline = [];
                    var EndDate = "";
                    var startdate = "";
                    if (Flag) {
                        EndDate = arr[i].endDate;
                        startdate = arr[i].startDate;
                    } else {
                        EndDate = arr[i].shortEndDate;
                        startdate = arr[i].shortStartDate;
                    }
                    var SibilingEndate = splitSlash(txtFirstDates);
                    SibilingEndate = new Date(splitSlash(txtFirstDates));
                    EndDate = new Date(splitSlash(EndDate));
                    startdate = new Date(splitSlash(startdate));
                    var CurrentDays = new Date(startdate - EndDate);
                    var PredecDay = new Date(SibilingEndate - startdate);

                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var Flag = false;
                    if (startdate > SibilingEndate) {
                        Flag = true;
                    }
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        Boolean: Flag

                    };
                    DayBaseline.push(Obj);
                    break;



                } else if (StringType == "SF") {
                    var Bool = false;;
                    DayBaseline = [];
                    var EndDate = "";
                    var startdate = "";
                    if (Flag) {
                        EndDate = arr[i].endDate;
                        startdate = arr[i].startDate;
                    }
                    else {
                        EndDate = arr[i].shortEndDate;
                        startdate = arr[i].shortStartDate;
                    }
                    var SibilingEndate = splitSlash(txtlasdates);
                    var SibilingStartDate = splitSlash(txtFirstDates);
                    SibilingEndate = new Date(splitSlash(txtlasdates));
                    SibilingStartDate = new Date(splitSlash(txtFirstDates));
                    EndDate = new Date(splitSlash(EndDate));
                    startdate = new Date(splitSlash(startdate));
                    var Flag = false;
                    if (startdate > SibilingStartDate) {
                        Bool = true;
                    } else if (EndDate < SibilingStartDate) {
                        Flag = true;
                    } else {
                        Bool = false;
                    }

                    var CurrentDays = new Date(startdate - EndDate);
                    var PredecDay = new Date(SibilingStartDate - EndDate);
                    var JoinDay = new Date(SibilingStartDate - startdate);
                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;
                    var JDays = JoinDay / 1000 / 60 / 60 / 24;
                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays,
                        JoinData: JDays,
                        Booliean: Bool,
                        Flags: Flag


                    };
                    DayBaseline.push(Obj);
                    break;



                }
                else {
                    DayBaseline = [];
                    var EndDate = "";
                    var startdate = "";
                    if (Flag) {
                        EndDate = arr[i].endDate;
                        startdate = arr[i].startDate;
                    } else {
                        EndDate = arr[i].shortEndDate;
                        startdate = arr[i].shortStartDate;
                    }
                    var SibilingEndate = splitSlash(txtlasdates);
                    SibilingEndate = new Date(splitSlash(txtlasdates));
                    EndDate = new Date(splitSlash(EndDate));
                    startdate = new Date(splitSlash(startdate));

                    var CurrentDays = new Date(startdate - EndDate);
                    var PredecDay = new Date(SibilingEndate - startdate);

                    daysPush = CurrentDays / 1000 / 60 / 60 / 24;
                    PredicDays = PredecDay / 1000 / 60 / 60 / 24;

                    var Obj =
                    {
                        CurrentData: daysPush,
                        siblingData: PredicDays

                    };
                    DayBaseline.push(Obj);
                    break;
                }
            }
            arr[i].subTask = getWidthEndGanttSubtree(arr[i].subTask, txtCount, crntCount, StringType, Flag);
        }
    }
    return arr;
}
//PREDECSSOR BASELINE CALCULATION ****************END****************
function getMargin(crntDate, stDate) {
    var last = splitSlash(stDate);
    var startDate = splitSlash(crntDate);
    var endCal = new Date(last);
    var startCal = new Date(startDate);
    var diff = new Date(endCal - startCal);
    marginData = ((diff / 1000 / 60 / 60 / 24) * -1) + 2;
    return marginData;
}
function getMarginLeast(crntDate, stDate) {
    var last = splitSlash(stDate);
    var startDate = splitSlash(crntDate);
    var endCal = new Date(last);
    var startCal = new Date(startDate);
    var diff = new Date(endCal - startCal);
    returnData = (diff / 1000 / 60 / 60 / 24) * -1;
    return returnData;
}
var findPredeccsor = "";
//PRDECSSOR AND FIRST TO START AND FINISH TO FINISH SPLIT FUNCTION
function recheckData(Predeccsors) {
    var findArray = [];
    var count = 0;
    var splitPred = Predeccsors.split(",");
    for (var i = 0; i < splitPred.length; i++) {
        var Minus = splitPred[i].indexOf('-');
        if (Minus < 0) {
            var spliteachpred = splitPred[i].split("+");
            count = 1;
        }
        else {
            var spliteachpred = splitPred[i].split("-");
            reverseFlag = true;
        }
        if (splitPred[i] != "") {
            for (var j = 0; j < spliteachpred.length; j++) {
                var str1 = spliteachpred[j];
                var str2 = "FS";
                var last1 = str1.substr(-2);
                var last2 = str1.substr(-1);
                var txtCount = "";
                var LagCounts = spliteachpred[spliteachpred.length - 1];
                if (str2 == last1) {
                    var put = str1.split('FS');
                    txtCount = parseInt(put);
                }
                str2 = "FF";
                if (str2 == last1) {

                    str1.split('FF');
                    txtCount = parseInt(str1[0]);
                }
                str2 = "SS";
                if (str2 == last1) {
                    str1.split('SS');
                    txtCount = parseInt(str1[0]);
                }
                str2 = "SF";
                if (str2 == last1) {
                    str1.split('SF');
                    txtCount = parseInt(str1[0]);
                }
                if (last2 != "S") {
                    if (last2 != "d") {
                        txtCount = parseInt(str1);
                    }
                }
                if (txtCount != "" && txtCount != NaN) {
                    var obj = {
                        textCount: txtCount,
                        LagCount: LagCounts,
                        StringType: last1,
                        Counts: count
                    };
                    findArray.push(obj);

                }

            }
        }

    }
    return findArray;
}
//DURATION OVER ALL CALCULATION *****************START******************
function SumCountofCount(Id) {
    newCount = 0;
    nextCount = 0;
    VarianceCount = 0;
    var valSec = false;
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (Id == arrayGantt[selectedIndex].id) {
            valSec = true;
        }
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            arrayGantt[selectedIndex].subTask = SubSumCount(arrayGantt[selectedIndex].subTask, Id, valSec);
        }
        else {
            if (Id == arrayGantt[selectedIndex].parentId) {
                var S = parseInt(arrayGantt[selectedIndex].duration);
                newCount += S;
                if (arrayGantt[selectedIndex].rowCount == 1) {
                    nextCount += S;

                }
            }

        }
    }

    return newCount;
}
function SubSumCount(arr, Id, valSec) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (Id == arr[i].parentId) {
                var V = arr[i].variance;
                var D = arr[i].duration;
                var S = D.split('d');
                if (D != '') {
                    newCount += parseInt(S[0]);
                    if (valSec == true) {
                        nextCount += parseInt(S[0]);
                    }
                } if (V != "") {
                    VarianceCount += parseInt(V);
                }
            }
            arr[i].subTask = SubSumCount(arr[i].subTask, Id, valSec);
        }


    }
    return arr;
}
//DURATION OVERALL CALCULATION  ************************END*********************
// true or false condition based parenId and row id matching rows hide and show (plus or minus) (Initial parent task row)
function hideDetails(rowCount, Id) {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].id == Id) {
            if (arrayGantt[selectedIndex].flag == true) {
                arrayGantt[selectedIndex].flag = false;
            }
            else {
                arrayGantt[selectedIndex].flag = true;
            } if (arrayGantt[selectedIndex].enable == true) {
                arrayGantt[selectedIndex].enable = false;
            }
            else {
                arrayGantt[selectedIndex].enable = true;
            }

        }
        var data = Contsruct(rowCount);
        if (data) {
            arrayGantt[selectedIndex].subTask = hideDetailSubtree(arrayGantt[selectedIndex].subTask, rowCount, Id, arrayGantt[selectedIndex]);
        }
    }
    LoadChart();

}
//PARENTLOOP
function Contsruct(rowCount) {
    var Cont = true;
    for (var i = 0; i < arrayGantt.length; i++) {
        if (arrayGantt[i].rowCount == rowCount) {
            if (arrayGantt[i].parentId == null && arrayGantt[i].subTask == 0) {
                Cont = false;
            }
        }
    }
    return Cont;
}
//SUBLOOP CONDITION IN HIDE DETAILS
function hideDetailSubtree(arr, rowCount, Id, Index) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == Id) {
                arr[i].flag = Index.flag;
                arr[i].enable = Index.enable;
                if (arr[i].subTask.length > 0) {
                    var data = arr[i].subTask.length;
                    for (var j = 0; j < data; j++) {
                        arr[i].subTask[j].flag = arr[i].flag;
                        arr[i].subTask[j].enable = arr[i].enable;
                        if (arr[i].subTask[j].subTask.length > 0) {
                            var check = arr[i].subTask[j].subTask.length;
                            for (var k = 0; k < check; k++) {
                                arr[i].subTask[j].subTask[k].flag = arr[i].subTask[j].flag;
                                arr[i].subTask[j].subTask[k].enable = arr[i].subTask[j].enable;
                                if (arr[i].subTask[j].subTask[k].subTask.length > 0) {
                                    arr[i].subTask[j].subTask[k].subTask = enableRow(arr[i].subTask[j].subTask[k].subTask, arr[i].subTask[j].subTask[k]);
                                }
                            }
                        }
                    }
                }
            }
            arr[i].subTask = hideDetailSubtree(arr[i].subTask, rowCount, Id, Index);
        }
    }
    return arr;
}
function enableRow(arr, sub) {
    for (var i = 0; i < arr.length; i++) {
        arr[i].flag = sub.flag;
        arr[i].enable = sub.enable;
    }
    return arr;
}
// true or false condition based parenId and row id matching rows hide and show (plus or minus) &(subtask task row)
function displayOnchange(entryId, rowCount) {
    HypridParentId = "";
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].parentId == entryId) {
            if (arrayGantt[selectedIndex].flag == true) {

                arrayGantt[selectedIndex].flag = false;
                arrayGantt[selectedIndex].enable = true;
            } else {
                arrayGantt[selectedIndex].flag = true;
                arrayGantt[selectedIndex].enable = false;
            }
        }
        else {
            arrayGantt[selectedIndex].subTask = displaySubtree(arrayGantt[selectedIndex].subTask, entryId, rowCount);
        }
    }
    LoadChart();
}
//SUBLOOP CONDITION IN TEXTBOX ONCHANGE FUNCTION
function displaySubtree(arr, entryId, rowCount) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == entryId) {
                if (arr[i].flag == true) {
                    arr[i].flag = false;
                }
                else {
                    arr[i].flag = true;
                }
                if (arr[i].subTask.length > 0) {
                    var data = arr[i].subTask.length;
                    for (var j = 0; j < data; j++) {
                        if (arr[i].subTask[j].flag == true) {
                            arr[i].subTask[j].flag = false;
                        } else {
                            arr[i].subTask[j].flag = true;
                        }
                        if (arr[i].subTask[j].enable == true) {
                            arr[i].subTask[j].enable = false;
                        } else {
                            arr[i].subTask[j].enable = true;
                        }
                        if (arr[i].subTask[j].subTask.length > 0) {
                            var check = arr[i].subTask[j].subTask.length;
                            for (var k = 0; k < check; k++) {
                                if (arr[i].subTask[j].subTask[k].flag == true) {
                                    arr[i].subTask[j].subTask[k].flag = false;
                                } else {
                                    arr[i].subTask[j].subTask[k].flag = true;
                                } if (arr[i].subTask[j].subTask[k].enable == true) {
                                    arr[i].subTask[j].subTask[k].enable = false;
                                } else {
                                    arr[i].subTask[j].subTask[k].enable = true;
                                }
                            }
                        }
                    }


                }
            }
            else {
                if (arr[i].rowCount == rowCount) {
                    if (arr[i].enable == false) {
                        arr[i].enable = true;
                    } else {
                        arr[i].enable = false;
                    }
                }

                arr[i].subTask = displaySubtree(arr[i].subTask, entryId, rowCount);
            }
        }
    }
    return arr;
}
//Parent loop
var MasterVarriance = 0;
//OVER CALCULATION IN VARRIANCE 
function CountVarriance(parentId) {
    MasterVarriance = 0;
    for (var a = 0; a < arrayGantt.length; a++) {

        if (arrayGantt[a].subTask.length > 0) {
            subCountVariance(arrayGantt[a].subTask, parentId);
        }
    }
}
function subCountVariance(arr, parentId) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == parentId) {
                var D = arr[i].variance;

                if (D != '') {
                    MasterVarriance += parseInt(D);
                }
            }
            arr[i].subTask = subCountVariance(arr[i].subTask, parentId);
        }
    }
    return arr;
}
/// varriance overall calculation
function VarrianceCount(Id) {

    VarianceCount = 0;

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        if (arrayGantt[selectedIndex].subTask.length > 0) {
            arrayGantt[selectedIndex].subTask = SubVarrianceCount(arrayGantt[selectedIndex].subTask, Id);
        }

        if (arrayGantt[selectedIndex].rowCount == 1) {
            CountVarriance(arrayGantt[selectedIndex].id);
            if (MasterVarriance != "" || MasterVarriance != 0) {
                arrayGantt[selectedIndex].variance = MasterVarriance;
            }
        }

    }

    return VarianceCount;
}
function SubVarrianceCount(arr, Id) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (Id == arr[i].parentId) {
                var D = arr[i].variance;
                if (D != "") {
                    VarianceCount += parseInt(D);
                }
            }
            arr[i].subTask = SubVarrianceCount(arr[i].subTask, Id);
        }


    }
    return arr;
}
function DurationCount(Id, duration, RowCount) {
    subCount = 0;
    mainCount = 0;

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].length > 0) {

        }
        else if (arrayGantt[selectedIndex].subTask.length > 0) {
            arrayGantt[selectedIndex].subTask = SubDurationCount(arrayGantt[selectedIndex].subTask, Id, duration, RowCount);
        }
        else {
            if (Id == arrayGantt[selectedIndex].parentId) {
                var S = parseInt(arrayGantt[selectedIndex].duration);
                subCount += S;
                if (arrayGantt[selectedIndex].rowCount == 1) {
                    mainCount += S;

                }
            }

        }
    }
    return subCount;
}
function SubDurationCount(arr, Id, duration, RowCount) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {

            if (Id == arr[i].parentId) {
                var D = arr[i].duration;
                var S = D.split('d');
                if (RowCount == arr[i].rowCount) {
                    var E = duration;
                    S = E.split('d');
                }
                if (D != '') {
                    subCount += parseInt(S[0]);
                    //if (valSec == true) {
                    //    mainCount += subCount;
                    //}
                }

            }
            arr[i].subTask = SubDurationCount(arr[i].subTask, Id, duration, RowCount);
        }

    }
    return arr;
}
//TABLE SIZE CHANGES FUNCTION (DROPDOWN)
function onChangesetsize() {

    var size = $("#ddlgant").val() == 1 ? 50 : $("#ddlgant").val() == 2 ? 100 : 0;
    var MSize = $("#gridsize").val();
    if (MSize != "") {
        $("#gridsize").val("");
    }
    if (size == 50) {
        $("#gridhide").show();
        $(".leftPanel").css({ "height": "", "width": size + "%" });
    } else {
        $("#gridhide").hide();
        $(".leftPanel").css({ "height": "unset", "width": size + "%" });
    }
    sessionStorage.setItem("ScreenView", $("#ddlgant").val());
}
//TABLE SIZE CHANGES FUNCTION (TEXTBOX)
function ScreenView() {
    var data = $("#ddlgant").val(sessionStorage.getItem("ScreenView"));
    var MSize = $("#gridsize").val();
    if (MSize == "")
        MSize = data[0].value == 1 ? 50 : data[0].value == 2 ? 100 : "";
    var size = $("#ddlgant").val() == 1 ? 50 : $("#ddlgant").val() == 2 ? 100 : parseInt(MSize);
    if (size == 100 || MSize == '100') {
        var size = MSize;
        $("#gridhide").hide();
        $('#ddlgant').empty();
        $(".leftPanel").css({ "height": "unset", "width": size + "%" });
        $('#ddlgant').append('<option value=1 > Gantt View</option><option value=2 selected> GridView</option>');
    }
    else {
        if (MSize > 0) {
            $('#ddlgant').empty();
            $(".leftPanel").css({ "height": "", "width": size + "%" });
            $('#ddlgant').append('<option value=1 selected> Gantt View</option><option value=2 > GridView</option>');
        }
    }
    var row = sessionStorage.getItem("RowCount");
    $(row).focus();
}
function getnewDuration(duration, Id, rowCount) {
    ZCount = 0;
    YCount = 0;
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        if (arrayGantt[selectedIndex].rowCount == 1) {
            if (arrayGantt[selectedIndex].subTask.length > 0) {
                var data = subgetnewDuration(arrayGantt[selectedIndex].subTask, arrayGantt[selectedIndex].id, duration, rowCount)

            }
        }
    }
    return ZCount;
}
function subgetnewDuration(arr, Id, duration, RowCount) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (Id == arr[i].parentId) {
                var D = arr[i].duration;

                var S = D.split('d');
                if (RowCount == arr[i].rowCount) {
                    var E = duration;
                    S = E.split('d');
                }
                if (D != '') {
                    ZCount += parseInt(S[0]);
                    mainCount += ZCount;

                }

            }
            arr[i].subTask = subgetnewDuration(arr[i].subTask, Id, duration, RowCount);
        }

    }
    return arr;
}
function Total(BaseCount) {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        if (arrayGantt[selectedIndex].rowCount == 1) {
            arrayGantt[selectedIndex].duration = BaseCount + 'd';
        }

    }
    return arrayGantt;
}
function SamePredecssorCheck(Predec, rowCount) {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            arrayGantt[selectedIndex].subTask = subSame(arrayGantt[selectedIndex].subTask, Predec, rowCount);
        }
    }
    return arrayGantt;
}
function subSame(arr, Predec, rowCount) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < Predec.length; j++) {
                var CommonCount = Predec[j];
                if (rowCount != CommonCount) {
                    if (arr[i].rowCount == CommonCount) {
                        var count = arr[i].predecessors;
                        for (var k = 0; k < count.length; k++) {
                            if (count[k] == rowCount) {
                                Circular = true;
                                break;
                            }
                            else {
                                Circular = false;
                            }
                        }
                    }
                } else {
                    Circular = true;
                    break;
                }

            }
            subSame(arr[i].subTask, Predec, rowCount);
        }

    }
    return arr;
}
//PREDECSSORS OVERLL CALCUALTION ************************START****************
function preValidate(Id, rowNo, Days, SiblingEnddate, siblingRowCount, predicType, siblingStart, selectRow, PredessorCount, Flag) {

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        if (arrayGantt[selectedIndex].rowCount == rowNo) {
            break;
        }
        else {
            arrayGantt[selectedIndex].subTask = predessorIdGet(arrayGantt[selectedIndex].subTask, Id, rowNo, Days, SiblingEnddate, siblingRowCount, predicType, siblingStart, selectRow, PredessorCount, Flag);
        }
    }
    return arrayGantt;
}
function predessorIdGet(arr, Id, rowNo, Days, SiblingDay, siblingRowCount, predicType, siblingStart, selectRow, PredessorCount, Flag) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            var siblingEndDate = SiblingDay;
            var siblingStartDate = siblingStart;
            if (arr[i].rowCount == rowNo) {
                arr[i].upDate = 1;
                var Day = parseInt(Days);
                if (Day != 0 || Day < 0 || Day > 0 || predicType != undefined || predicType != "") {
                    if (predicType == "Finish-to-start" || predicType == "Finish-to-Finish") {
                        if (rowNo != siblingRowCount) {
                            var DatePickchange = siblingEndDate;
                            if (DatePickchange != "") {
                                var Duration = arr[i].duration;
                                if (Duration == "0d") {
                                    Duration = "1";
                                } else if (Duration == "") {
                                    Duration = "1";
                                    arr[i].duration = "1d";
                                }
                                var split = Duration.split('d');
                                var durationDay = parseInt(split[0]);
                                if (Circular == false) {

                                    var EndDate = "";

                                    var startDate = splitSlash(DatePickchange);
                                    if (Flag) {
                                        EndDate = splitSlash(arr[i].shortEndDate);
                                    } else {
                                        EndDate = splitSlash(arr[i].endDate);
                                    }
                                    var sDate = new Date(startDate);
                                    var IntialsiblingEndDay = new Date(startDate);
                                    var eDate = new Date(EndDate);
                                    //start date increse in add day based predescssors
                                    startDate = startDate;
                                    startDate = new Date(startDate.replace(/-/g, "/"));
                                    var endDate = "", noOfDaysToAdd = Day, count = 0;
                                    //Loop of Day Add   
                                    if (Day == 0)
                                        noOfDaysToAdd = 1;
                                    if (noOfDaysToAdd > 0) {
                                        endDate = AddLagDays(startDate, noOfDaysToAdd, arr[i].workingDays == '' ? arr[i].slDate : arr[i].workingDays);
                                    }
                                    else {
                                        noOfDaysToAdd = parseInt(noOfDaysToAdd) * -1;
                                        endDate = new Date(startDate);
                                        endDate = MinusLagDays(endDate, noOfDaysToAdd, arr[i].workingDays);
                                    }
                                    //end date increase in duration based calculation
                                    var FinalStartDate = endDate;
                                    var siblingEndDay = endDate;

                                    var A = formatDate(endDate);
                                    var endUpDay = splitSlash(A);
                                    var eDate = FinalStartDate;
                                    eDate = new Date(endUpDay);
                                    var enUpDate = "", noOfDays = durationDay, counts = 0;
                                    enUpDate = predecAddDays(eDate, noOfDays-1, predicType, arr[i].workingDays == '' ? arr[i].slDate : arr[i].workingDays);
                                    if (predicType == "Finish-to-start") {
                                        if (Flag) {
                                            arr[i].shortStartDate = formatDate(FinalStartDate);
                                            arr[i].shortEndDate = formatDate(enUpDate);
                                        }
                                        else {
                                            arr[i].startDate = formatDate(FinalStartDate);
                                            arr[i].endDate = formatDate(enUpDate);
                                        }

                                        if (arr[i].predecessors != "")
                                            arr[i].predecessors = conCodinatePredecsssors();
                                        else
                                            arr[i].predecessors = conCodinatePredecsssors();
                                    }
                                    else if (predicType == "Finish-to-Finish") {
                                        var txtData = conCodinatePredecsssors();

                                        if (txtData.indexOf('FS') > 0 || txtData.indexOf('SS') > 0 || txtData.indexOf('SF') > 0) {
                                            if (enUpDate > IntialsiblingEndDay) {
                                                if (Flag) {
                                                    arr[i].shortEndDate = formatDate(FinalStartDate);
                                                    arr[i].shortStartDate = formatDate(enUpDate);
                                                } else {
                                                    arr[i].endDate = formatDate(FinalStartDate);
                                                    arr[i].startDate = formatDate(IntialsiblingEndDay);
                                                }

                                                if (arr[i].predecessors != "")
                                                    arr[i].predecessors = conCodinatePredecsssors();
                                                else
                                                    arr[i].predecessors = conCodinatePredecsssors();


                                            }
                                            else {
                                                var enUpDate = "", noOfDays = durationDay, counts = 0;
                                                enUpDate = AddLagDays(IntialsiblingEndDay, durationDay, arr[i].workingDays == '' ? arr[i].slDate : arr[i].workingDays);

                                                if (Flag) {
                                                    arr[i].shortStartDate = formatDate(FinalStartDate);
                                                    arr[i].shortEndDate = formatDate(enUpDate);
                                                }
                                                else {
                                                    arr[i].startDate = formatDate(FinalStartDate);
                                                    arr[i].endDate = formatDate(enUpDate);

                                                }
                                                if (arr[i].predecessors != "")
                                                    arr[i].predecessors = conCodinatePredecsssors();
                                                else
                                                    arr[i].predecessors = conCodinatePredecsssors();
                                            }
                                        }
                                        else {

                                            if (Flag) {
                                                arr[i].shortEndDate = formatDate(FinalStartDate);
                                                arr[i].shortStartDate = formatDate(enUpDate);
                                            } else {
                                                arr[i].endDate = formatDate(FinalStartDate);
                                                arr[i].startDate = formatDate(enUpDate);
                                            }

                                            if (arr[i].predecessors != "")
                                                arr[i].predecessors = conCodinatePredecsssors();
                                            else
                                                arr[i].predecessors = conCodinatePredecsssors();
                                        }
                                    }                                //                                
                                    //Multiple predecssors day check ---start
                                    if (Flag) {
                                        relatedDayPredecssors(arr[i].rowCount, arr[i].shortEndDate, Flag);
                                    }
                                    else {
                                        relatedDayPredecssors(arr[i].rowCount, arr[i].endDate, Flag);
                                    }
                                    shortEarlyDate(arr[i].parentId, Flag);
                                    //---end
                                    if (Flag) {
                                        var Object = ObjPush(arr[i].shortStartDate, arr[i].shortEndDate, arr[i].startDate, arr[i].endDate, arr[i].desc, arr[i].predecessors, Flag);
                                        arr[i].values = [];
                                        arr[i].values.push(Object);
                                    }
                                    else {
                                        var Object = ObjPush(arr[i].startDate, arr[i].endDate, arr[i].shortStartDate, arr[i].shortEndDate, arr[i].desc, arr[i].predecessors, Flag);
                                        arr[i].values = [];
                                        arr[i].values.push(Object);
                                    }
                                    break;
                                } else {
                                    alert("circular dependancy");
                                    arr[i].predecessors = "";
                                    $("#predecessors_" + arr[i].rowCount).val("");
                                    Circular = false;
                                    break;
                                }
                            }
                        }
                        else {
                            alert("circular dependancy");
                            arr[i].predecessors = "";
                            $("#predecessors_" + arr[i].rowCount).val("");
                            Circular = false;
                            break;
                        }
                    }
                    else if (predicType == "Start-to-Start" || predicType == "Start-to-Finish") {
                        if (rowNo != siblingRowCount) {
                            var DatePickchange = siblingStartDate;
                            if (DatePickchange != "") {
                                var Duration = arr[i].duration;
                                if (Duration == "0d") {
                                    Duration = "1";
                                } else if (Duration == "") {
                                    Duration = "1";
                                    arr[i].duration = "1d";
                                }
                                var split = Duration.split('d');
                                var durationDay = parseInt(split[0]);
                                if (!Circular) {

                                    var startDate = splitSlash(DatePickchange);
                                    var EndDate = "";
                                    if (Flag) {
                                        EndDate = splitSlash(arr[i].shortEndDate);
                                    } else {
                                        EndDate = splitSlash(arr[i].endDate);
                                    }
                                    var sDate = new Date(startDate);
                                    var eDate = new Date(EndDate);
                                    //start date increse in add day based predescssors
                                    startDate = startDate;
                                    startDate = new Date(startDate);
                                    var endDate = "", noOfDaysToAdd = Day, count = 0;
                                    //Loop of Day Add
                                    if (noOfDaysToAdd > 0) {
                                        endDate = AddLagDays(startDate, noOfDaysToAdd, arr[i].workingDays == '' ? arr[i].slDate : arr[i].workingDays);
                                    } else {
                                        noOfDaysToAdd = parseInt(noOfDaysToAdd) * -1;
                                        endDate = MinusLagDays(startDate, noOfDaysToAdd, arr[i].workingDays);

                                    }
                                    //end date increase in duration based calculation
                                    var FinalStartDate = endDate;
                                    var A = formatDate(FinalStartDate);
                                    var endUpDay = splitSlash(A);
                                    var eDate = FinalStartDate;



                                    eDate = new Date(endUpDay);
                                    var enUpDate = "", noOfDays = durationDay, counts = 0;
                                    enUpDate = SubpredecAddDays(eDate, noOfDays - 1, predicType, arr[i].workingDays == '' ? arr[i].slDate : arr[i].workingDays);

                                    if (predicType == "Start-to-Start") {
                                        if (Flag) {
                                            arr[i].shortStartDate = formatDate(FinalStartDate);
                                            arr[i].shortEndDate = formatDate(enUpDate);
                                        } else {
                                            arr[i].startDate = formatDate(FinalStartDate);
                                            arr[i].endDate = formatDate(enUpDate);

                                        }

                                        if (arr[i].predecessors != "")
                                            arr[i].predecessors = conCodinatePredecsssors();
                                        else
                                            arr[i].predecessors = conCodinatePredecsssors();
                                    }
                                    else {
                                        if (Flag) {
                                            arr[i].shortEndDate = formatDate(FinalStartDate);
                                            arr[i].shortStartDate = formatDate(enUpDate);
                                        } else {
                                            arr[i].endDate = formatDate(FinalStartDate);
                                            arr[i].startDate = formatDate(enUpDate);
                                        }

                                        if (arr[i].predecessors != "")
                                            arr[i].predecessors = conCodinatePredecsssors();
                                        else
                                            arr[i].predecessors = conCodinatePredecsssors();
                                    }

                                    //Multiple predecssors day check ---start
                                    if (Flag) {
                                        relatedDayPredecssors(arr[i].rowCount, arr[i].shortEndDate, Flag);
                                    }
                                    else {
                                        relatedDayPredecssors(arr[i].rowCount, arr[i].endDate, Flag);
                                    }
                                    var data = shortEarlyDate(arr[i].parentId, Flag);
                                    //---end
                                    if (Flag) {
                                        var Object = ObjPush(arr[i].shortStartDate, arr[i].shortEndDate, arr[i].startDate, arr[i].endDate, arr[i].desc, arr[i].predecessors, Flag);
                                        arr[i].values = [];
                                        arr[i].values.push(Object);
                                    }
                                    else {
                                        var Object = ObjPush(arr[i].startDate, arr[i].endDate, arr[i].startDate, arr[i].shortStartDate, arr[i].desc, arr[i].predecessors, Flag);
                                        arr[i].values = [];
                                        arr[i].values.push(Object);
                                    }
                                    break;
                                } else {
                                    alert("circular dependancy");
                                    arr[i].predecessors = "";
                                    $("#predecessors_" + arr[i].rowCount).val("");
                                    Circular = false;
                                    break;
                                }
                            }
                        }
                        else {
                            alert("circular dependancy");
                            arr[i].predecessors = "";
                            $("#predecessors_" + arr[i].rowCount).val("");
                            Circular = false;
                            break;
                        }
                    }
                    else {
                        var DatePickchange = siblingEndDate;
                        if (DatePickchange != "") {
                            var startDate = "";
                            if (Flag)
                                startDate = splitSlash(arr[i].shortStartDate);
                            else
                                startDate = splitSlash(arr[i].startDate);
                            var Duration = arr[i].duration;
                            if (Duration == "") {
                                Duration = "1";
                                arr[i].Duration = "1d";
                            }
                            if (!Circular) {
                                var split = Duration.split('d');
                                var durationDay = parseInt(split[0]);
                                //arr[i].upDate = 1;
                                var EndDate = "";
                                if (Flag) {
                                    EndDate = splitSlash(arr[i].shortEndDate);
                                } else {
                                    EndDate = splitSlash(arr[i].endDate);
                                }
                                var sDate = new Date(startDate);
                                var eDate = new Date(EndDate);
                                var diffTime = Math.abs(eDate - sDate);
                                if (rowNo < siblingRowCount) {
                                    var Checkdays = addDays(splitSlash(DatePickchange), durationDay);

                                } else {
                                    var Checkdays = addDays(splitSlash(DatePickchange), durationDay);
                                }
                                if (arr[i].duration == "") {
                                    var Checkdays = addnewDays(DatePickchange, durationDay);
                                }
                                var date = new Date(Checkdays);
                                var s1 = new Date(splitSlash(arr[i].shortStartDate));
                                var S2 = new Date(splitSlash(arr[i].shortEndDate));
                                if (Flag) {
                                    arr[i].shortStartDate = new Date(splitSlash(DatePickchange));
                                    arr[i].shortStartDate = weekEnd(arr[i].shortStartDate, arr[i].workingDays);
                                    arr[i].shortStartDate = formatDate(arr[i].shortStartDate);
                                }
                                else {
                                    arr[i].startDate = new Date(splitSlash(DatePickchange));
                                    arr[i].startDate = weekEnd(arr[i].startDate, arr[i].workingDays);

                                    arr[i].startDate = formatDate(arr[i].startDate);
                                }
                                var EDate = formatDate(date);
                                if (Flag)
                                    arr[i].shortEndDate = EDate;
                                else
                                    arr[i].endDate = EDate;
                                var predec = $("#predecessors_" + arr[i].rowCount).val();
                                var splitChange = predec.split(',');
                                if (Flag) {
                                    relatedDayPredecssors(arr[i].rowCount, arr[i].shortEndDate, Flag);
                                }
                                else {
                                    relatedDayPredecssors(arr[i].rowCount, arr[i].endDate, Flag);
                                }
                                var data = shortEarlyDate(arr[i].parentId, Flag);
                                for (var j = 0; j < splitChange.length; j++) {
                                    if (splitChange[j] != rowNo) {
                                        if (arr[i].duration == "") {
                                            arr[i].duration = "1d";
                                            arr[i].predecessors = predec.toString();
                                        } else {
                                            arr[i].predecessors = predec.toString();
                                        }

                                        if (Flag) {
                                            var Object = ObjPush(arr[i].shortStartDate, arr[i].shortEndDate, arr[i].startDate, arr[i].endDate, arr[i].desc, arr[i].predecessors, Flag);
                                            arr[i].values = [];
                                            arr[i].values.push(Object);

                                        } else {
                                            var Object = ObjPush(arr[i].startDate, arr[i].endDate, arr[i].shortStartDate, arr[i].shortEndDate, arr[i].desc, arr[i].predecessors, Flag);
                                            arr[i].values = [];
                                            arr[i].values.push(Object);
                                        }
                                    }
                                    else {
                                        arr[i].predecessors = "";
                                        break;
                                    }
                                }
                            }
                            else {

                                alert("circular dependancy");
                                arr[i].predecessors = "";
                                Circular = false;
                                $("#predecessors_" + arr[i].rowCount).val("");
                                break;
                            }
                            break;
                        }

                    }
                }
                else {
                    if (rowNo != siblingRowCount) {
                        var DatePickchange = siblingEndDate;
                        if (DatePickchange != "") {
                            var startDate = "";
                            if (Flag) {
                                startDate = splitSlash(arr[i].shortStartDate);
                            } else {
                                startDate = splitSlash(arr[i].startDate);
                            }

                            var Duration = arr[i].duration;
                            if (Duration == "") {
                                Duration = "1";
                                arr[i].Duration = "1d";
                            }
                            var split = Duration.split('d');
                            var durationDay = parseInt(split[0]);
                            var EndDate = "";
                            if (Flag) {
                                EndDate = splitSlash(arr[i].shortEndDate);
                            } else {
                                EndDate = splitSlash(arr[i].endDate);
                            }

                            var sDate = new Date(startDate);
                            var eDate = new Date(EndDate);
                            var diffTime = Math.abs(eDate - sDate);
                            if (rowNo < siblingRowCount) {
                                var Checkdays = addDays(splitSlash(DatePickchange), durationDay);

                            } else {
                                var Checkdays = addDays(DatePickchange, durationDay);
                            }
                            if (arr[i].duration == "") {
                                var Checkdays = addnewDays(DatePickchange, durationDay);
                            }
                            var date = new Date(Checkdays);
                            if (Flag) {
                                arr[i].shortStartDate = new Date(splitSlash(DatePickchange));
                                arr[i].shortStartDate = weekEnd(arr[i].shortStartDate, arr[i].workingDays);
                                arr[i].shortStartDate = formatDate(arr[i].shortStartDate);
                                var EDate = formatDate(date);
                                arr[i].shortEndDate = EDate;
                            } else {
                                arr[i].startDate = new Date(splitSlash(DatePickchange));
                                arr[i].startDate = weekEnd(arr[i].startDate, arr[i].workingDays);
                                arr[i].startDate = formatDate(arr[i].startDate);
                                var EDate = formatDate(date);
                                arr[i].endDate = EDate;
                            }
                            if (arr[i].duration == "") {
                                arr[i].duration = "1d";
                                arr[i].predecessors = PredessorCount.toString();
                            }
                            else {
                                arr[i].predecessors = PredessorCount.toString();
                            }
                            if (Flag) {
                                relatedDayPredecssors(arr[i].rowCount, arr[i].shortEndDate, Flag);
                            }
                            else {
                                relatedDayPredecssors(arr[i].rowCount, arr[i].endDate, Flag);
                            }
                            var data = shortEarlyDate(arr[i].parentId, Flag);
                            if (Flag) {
                                var Object = ObjPush(arr[i].shortStartDate, arr[i].shortEndDate, arr[i].startDate, arr[i].endDate, arr[i].desc, arr[i].predecessors, Flag);
                                arr[i].values = [];
                                arr[i].values.push(Object);

                            } else {
                                var Object = ObjPush(arr[i].startDate, arr[i].endDate, arr[i].shortStartDate, arr[i].shortEndDate, arr[i].desc, arr[i].predecessors, Flag);
                                arr[i].values = [];
                                arr[i].values.push(Object);
                            }
                            break;
                        }
                    }
                    else {
                        alert("circular dependancy");
                        arr[i].predecessors = "";
                        $("#predecessors_" + arr[i].rowCount).val("");

                    }
                }
            }
            arr[i].subTask = predessorIdGet(arr[i].subTask, Id, rowNo, Days, SiblingDay, siblingRowCount, predicType, siblingStart, selectRow, PredessorCount, Flag);
        }
    }
    return arr;
}
//PREDECSSORS OVERLL CALCUALTION ************************END*******************
//Lag Day Calculation ****************************Start********************
function ObjPush(d1, d2, s1, s2, desc, predecessors, Flag) {
    d1 = new Date(toDate(d1));
    d2 = new Date(toDate(d2));
    s1 = new Date(toDate(s1));
    s2 = new Date(toDate(s2));
    var obj = {
        from: "/Date(" + d1.getTime() + ")/",
        to: "/Date(" + d2.getTime() + ")/",
        pfrom: "/Date(" + s1.getTime() + ")/",
        pto: "/Date(" + s2.getTime() + ")/",
        label: desc,
        desc: "Task: " + desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
        customClass: "#778461",
        dataObj: Flag,
        Predeccsors: predecessors,
    }
    return obj;
}
function predecAddDays(eDate, noOfDays, predicType, WorkingDays) {
    var counts = 0; var enUpDate = new Date(eDate);
    while (counts < noOfDays) {
        if (predicType == "Finish-to-start") {
            enUpDate = new Date(eDate.setDate(eDate.getDate() + 1));
        } else if (predicType == "Finish-to-Finish") {
            enUpDate = new Date(eDate.setDate(eDate.getDate() - 1));
        }
        if (WorkingDays == "5") {
            if (enUpDate.getDay() != 0 && enUpDate.getDay() != 6) {
                counts++;
            }
        } else if (WorkingDays == "6") {
            if (enUpDate.getDay() != 0) {
                counts++;
            }
        } else {
            counts++;
        }
    }
    return enUpDate;
}
function SubpredecAddDays(eDate, noOfDays, predicType, WorkingDays) {
    var counts = 0; var enUpDate = new Date(eDate);
    while (counts < noOfDays) {
        if (predicType == "Start-to-Start") {
            enUpDate = new Date(eDate.setDate(eDate.getDate() + 1));

        } else if (predicType == "Start-to-Finish") {
            enUpDate = new Date(eDate.setDate(eDate.getDate() - 1));
        }

        if (WorkingDays == "5") {
            if (enUpDate.getDay() != 0 && enUpDate.getDay() != 6) {
                counts++;
            }
        } else if (WorkingDays == "6") {
            if (enUpDate.getDay() != 0) {
                counts++;
            }
        } else {
            counts++;
        }
    }
    return enUpDate;
}
function AddLagDays(startDate, noOfDaysToAdd, WorkingDays) {
    var endDate = "", count = 0;

    while (count < noOfDaysToAdd) {
        endDate = new Date(startDate.setDate(startDate.getDate()+1));
        if (WorkingDays == "5") {
            if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                count++;
            }
        } else if (WorkingDays == "6") {
            if (endDate.getDay() != 0) {
                count++;
            }
        } else {
            count++;
        }
    }
    return endDate;
}
function MinusLagDays(startDate, noOfDaysToAdd, WorkingDays) {
    var endDate = startDate, count = 0;
    while (count < noOfDaysToAdd) {
        if (WorkingDays == "5") {
            if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                count++;
            }
        } else if (WorkingDays == "6") {
            if (endDate.getDay() != 0) {
                count++;
            }
        } else {
            count++;
        }
        endDate = new Date(startDate.setDate(startDate.getDate() - 1));
    }
    return endDate;
}
//*************************End********************
function relatedDayPredecssors(rowCount, startDate, Flag) {
    for (var i = 0; i < arrayGantt.length; i++) {
        arrayGantt[i].subTask = subrelatedDayPredecssors(arrayGantt[i].subTask, rowCount, startDate, Flag);
    }
}
function subrelatedDayPredecssors(arr, rowCount, startDate, Flag) {
    if (arr.length > 0) {

        for (var i = 0; i < arr.length; i++) {
            var Prdecssors = arr[i].predecessors;
            var PDCount = arr[i].rowCount;
            //Prdecssors = Prdecssors.split(',');
            Prdecssors = recheckData(Prdecssors);
            if (Prdecssors.length > 0) {
                subDatatree(Prdecssors, rowCount, startDate, Flag, arr[i], PDCount);
            }
            subrelatedDayPredecssors(arr[i].subTask, rowCount, startDate, Flag);
        }
    }
    return arr;
}
function subDatatree(Prdecssors, rowCount, startDate, Flag, arr, PDCount) {
    for (var k = 0; k < Prdecssors.length; k++) {
        if (rowCount == Prdecssors[k].textCount) {
            var duration = arr.duration;
            var IMPDay = new Date(splitSlash(startDate));
            IMPDay = IMPDay.setDate(IMPDay.getDate() + 1);
            startDate = formatDate(IMPDay);
            var Checkdays = "";
            if (Prdecssors[k].StringType > 0 || Prdecssors[k].StringType == "FS" || Prdecssors[k].StringType == "SS")
                Checkdays = addDays(splitSlash(startDate), duration);
            else if (Prdecssors[k].StringType == "FF" || Prdecssors[k].StringType == "SF")
                Checkdays = MinusDays(splitSlash(startDate), duration);
            if (Flag) {
                if (Prdecssors[k].StringType > 0 || Prdecssors[k].StringType == "FS" || Prdecssors[k].StringType == "SS")
                    arr.shortStartDate = startDate;
                else if (Prdecssors[k].StringType == "FF" || Prdecssors[k].StringType == "SF")
                    arr.shortEndDate = startDate;
            }
            else {
                if (Prdecssors[k].StringType > 0 || Prdecssors[k].StringType == "FS" || Prdecssors[k].StringType == "SS")
                    arr.startDate = startDate;
                else if (Prdecssors[k].StringType == "FF" || Prdecssors[k].StringType == "SF")
                    arr.endDate = startDate;
            }
            var date = new Date(Checkdays);
            if (Flag) {
                if (Prdecssors[k].StringType > 0 || Prdecssors[k].StringType == "FS" || Prdecssors[k].StringType == "SS")
                    arr.shortEndDate = formatDate(date);
                else if (Prdecssors[k].StringType == "FF" || Prdecssors[k].StringType == "SF")
                    arr.shortStartDate = formatDate(date);
            }
            else {
                if (Prdecssors[k].StringType > 0 || Prdecssors[k].StringType == "FS" || Prdecssors[k].StringType == "SS")
                    arr.endDate = formatDate(date);
                else if (Prdecssors[k].StringType == "FF" || Prdecssors[k].StringType == "SF")
                    arr.startDate = formatDate(date);
            }

            var d1 = "";
            var d2 = "";
            var s1 = "";
            var s2 = "";
            if (Flag) {
                d1 = new Date(toDate(arr.shortStartDate));
                d2 = new Date(toDate(arr.shortEndDate));
                s1 = new Date(toDate(arr.startDate));
                s2 = new Date(toDate(arr.endDate));
            }
            else {
                d1 = new Date(toDate(arr.startDate));
                d2 = new Date(toDate(arr.endDate));
                s1 = new Date(toDate(arr.shortStartDate));
                s2 = new Date(toDate(arr.shortEndDate));
            }
            arr.values = [];
            var obj = {
                from: "/Date(" + d1.getTime() + ")/",
                to: "/Date(" + d2.getTime() + ")/",
                pfrom: "/Date(" + s1.getTime() + ")/",
                pto: "/Date(" + s2.getTime() + ")/",
                label: arr.desc,
                desc: "Task: " + arr.desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                customClass: "#778461",
                dataObj: Flag,
                Predeccsors: arr.predecessors,
            }
            arr.values.push(obj);
            if (Flag)
                relatedDayPredecssors(PDCount, arr.shortEndDate, Flag)
            else
                relatedDayPredecssors(PDCount, arr.endDate, Flag)
        }


    }
}
function weekEnd(start, workingDays) {

    var count = 0;
    while (count < 1) {
        start = new Date(start.setDate(start.getDate() + 1));
        if (workingDays == "5") {
            if (start.getDay() != 0 && start.getDay() != 6) {
                count++;
            } else {

            }
        } else if (workingDays == "6") {
            if (start.getDay() != 0) {
                count++;
            } else {

            }
        } else {
            count++;
        }

    }
    return start;
}
//PREDECSSOR VALUES GET ON TABLE **********************START********************
function ConvertP(val) {
    if (val == 'Finish-to-Start') {
        val = "Finish-to-start";
    }
    return val;
}
function genricPredic() {
    var s = [];
    var data = $("#newRow > tr > td > select.prdS" + globalVarribal);
    for (var i = 0; i < data.length; i++) {
        s.push(data[i].value);
    }
    return s;
}
function gettextpredic() {
    var s = [];
    var data = $("#newRow > tr > td > .prd" + globalVarribal);
    for (var i = 0; i < data.length; i++) {
        s.push(data[i].value);
    }
    return s;
}
function getLagpredic() {
    var s = [];
    var data = $("#newRow > tr > td > .prdL" + globalVarribal);
    for (var i = 0; i < data.length; i++) {
        s.push(data[i].value);
    }
    return s;
}
//***************************************END*************************
//PREDCSSORS TEXTBOX VALUE BIND ******************START************************
function conCodinatePredecsssors() {
    var split = "";
    var predicType = "";
    predicType = genricPredic();
    var textCount = gettextpredic();
    var lagCount = getLagpredic();
    for (var i = 0; i < predicType.length; i++) {
        var P = predicType[i];
        var T = textCount[i];
        var L = parseInt(lagCount[i]);

        if (P == "Finish-to-start") {
            P = "FS";
        } else if (P == "Finish-to-Finish") {
            P = "FF";
        } else if (P == "Start-to-Start") {
            P = "SS";
        } else if (P == "Start-to-Finish") {
            P = "SF";
        }
        if (isNaN(L)) {
            if (predicType.length > 1)
                if (i == (predicType.length - 1))
                    split += T + P;
                else
                    split += T + P + ",";
            else
                split += T + P;

        }
        else {
            if (L < 0) {

                if (lagCount[i] != "") {
                    if (i == (predicType.length - 1))
                        split += T + P + L + 'd';
                    else
                        split += T + P + L + 'd' + ",";
                } else {
                    split += T + P + "-d" + ",";
                }
            }
            else {
                if (lagCount[i] != "") {
                    if (i == (predicType.length - 1))
                        split += T + P + '+' + L + 'd';
                    else
                        split += T + P + '+' + L + 'd' + ",";
                } else {

                    split += T + P + "+d" + ",";
                }
            }
        }

    }
    return split;
}
//*****************************************END***********************
//LOCAL DATE CONVERT FUCNTION
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('-');
}
var addDays = function (input_date, days) {
    input_date
    var currentDate = new Date(input_date);
    if (days != 0) {
        currentDate.setDate(currentDate.getDate() + parseInt(days));
    }
    return currentDate;
}
var MinusDays = function (input_date, days) {
    input_date
    var currentDate = new Date(input_date);
    if (days != 0) {
        currentDate.setDate(currentDate.getDate() - parseInt(days));
    }
    return currentDate;

}
var addnewDays = function (input_date, days) {
    input_date = splitSlash(input_date);
    var currentDate = new Date(input_date);
    if (days != 0) {
        currentDate.setDate(currentDate.getDate() + parseInt(days));
    }
    return currentDate;
}
//OVER ALL START ACTUAL START AND END DATE CALCUALTION******************START*****************
function CalculateSelectedObj(currentObj, rowNo, color, input, selectedInput, sDay, parentId, sTaskStatus, Flag) {

    if (selectedInput == 1 || selectedInput == 2) {
        if (Flag) {
            if (currentObj.shortStartDate != null && currentObj.shortStartDate != '' && currentObj.shortStartDate != undefined
                && currentObj.shortEndDate != null && currentObj.shortEndDate != '' && currentObj.shortEndDate != undefined) {
                var duration = parseInt(currentObj.duration);
                var startDate = currentObj.shortStartDate;
                LastEndDay = startDate;
                startDate = splitSlash(startDate);
                startDate = new Date(startDate.replace(/-/g, "/"));
                var endDate = "", noOfDaysToAdd = duration, count = 0;
                endDate = new Date(startDate);
                while (count < noOfDaysToAdd) {
                    if (sDay == "5") {
                        if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                            count++;
                        }
                    } else if (sDay == "6") {
                        if (endDate.getDay() != 0) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                    endDate.setDate(endDate.getDate() + 1);
                }
                endDate.setDate(endDate.getDate() - 1);
                var changeDate = formatDate(endDate);
                var dCounts = SumCountofCount(currentObj.id);
                if (dCounts != 0) {
                    duration = dCounts;
                    currentObj.upDate = 1;
                }
                if (currentObj.rowCount == 1) {
                    dCount = SumCountofCount(currentObj.id);
                    duration = nextCount;
                    currentObj.upDate = 1;
                }
                var VarrianceCounts = VarrianceCount(currentObj.id);
                if (VarrianceCounts != 0) {
                    if (parseInt(VarrianceCounts) < 0) {
                        currentObj.variance = parseInt(VarrianceCounts) * -1;
                    } else {
                        currentObj.variance = VarrianceCounts;
                    }
                }
                currentObj.shortEndDate = changeDate;
                if (currentObj.rowCount == rowNo) {
                    var SD = splitSlash(currentObj.shortStartDate);
                    var ED = splitSlash(changeDate);
                    if (sDay == "")
                        sDay = currentObj.slDate;
                    var health = SetHealthValue(SD, ED, sTaskStatus, sDay, parentId);
                    if (health != undefined) {                       
                        currentObj.health = health.color;
                        currentObj.percentComplete = health.percentage != "" ? health.percentage + "%" : "";
                    }

                }
                var sDate = toDate(currentObj.shortStartDate);
                var eDate = toDate(currentObj.shortEndDate);
                var D2 = toDate(currentObj.startDate);
                var D3 = toDate(currentObj.endDate);
                currentObj.values = [];
                var obj = {
                    from: "/Date(" + new Date(sDate).getTime() + ")/",
                    to: "/Date(" + new Date(eDate).getTime() + ")/",
                    pfrom: "/Date(" + new Date(D2).getTime() + ")/",
                    pto: "/Date(" + new Date(D3).getTime() + ")/",
                    label: currentObj.desc,
                    desc: "Task: " + currentObj.desc + "Date: " + trimDate(sDate) + " to " + trimDate(eDate),
                    customClass: color,
                    dataObj: Flag,
                    Predeccsors: currentObj.predecessors,
                }
                currentObj.values.push(obj);
                currentObj.shortStartDate = currentObj.shortStartDate;
                currentObj.duration = isNaN(duration) ? "" : duration + "d";
                currentObj.workingDays = sDay;
                if (parentId != 0) {
                    heathPercent(parentId);
                    shortEarlyDate(parentId, Flag);
                }
            }
        }
        else {
            if (currentObj.startDate != null && currentObj.startDate != '' && currentObj.startDate != undefined
                && currentObj.endDate != null && currentObj.endDate != '' && currentObj.endDate != undefined) {
                var duration = parseInt(currentObj.duration);
                var startDate = currentObj.startDate;
                LastEndDay = startDate;
                var crtStartDate = currentObj.startDate;
                var e = startDate.split("-");
                startDate = e[1] + '-' + e[0] + '-' + e[2];
                startDate = new Date(startDate.replace(/-/g, "/"));
                var endDate = "", noOfDaysToAdd = duration, count = 0;
                endDate = new Date(startDate);
                while (count < noOfDaysToAdd) {
                    if (sDay == "5") {
                        if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                            count++;
                        }
                    } else if (sDay == "6") {
                        if (endDate.getDay() != 0) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                    endDate.setDate(endDate.getDate() + 1);
                }
                endDate.setDate(endDate.getDate() - 1);
                var changeDate = formatDate(endDate);
                //var prdecChange = predecChange(currentObj);
                var dCounts = SumCountofCount(currentObj.id);
                if (dCounts != 0) {
                    duration = dCounts;
                    currentObj.upDate = 1;
                }
                if (currentObj.rowCount == 1) {
                    dCount = SumCountofCount(currentObj.id);
                    duration = nextCount;
                    currentObj.upDate = 1;
                }

                var VarrianceCounts = VarrianceCount(currentObj.id);
                if (VarrianceCounts != 0) {

                    if (parseInt(VarrianceCounts) < 0) {
                        currentObj.variance = parseInt(VarrianceCounts) * -1;
                    } else {
                        currentObj.variance = VarrianceCounts;
                    }
                }
                currentObj.endDate = changeDate;
                if (currentObj.rowCount == rowNo) {
                    var SD = splitSlash(currentObj.startDate);
                    var ED = splitSlash(changeDate);
                    if (sDay == "")
                        sDay = currentObj.slDate;
                    var health = SetHealthValue(SD, ED, sTaskStatus, sDay, parentId);
                    if (health != undefined) {
                        
                        currentObj.health = health.color;
                        currentObj.percentComplete = health.percentage != "" ? health.percentage + "%" : "";
                    }

                }
                var sDate = toDate(currentObj.startDate);
                var eDate = toDate(currentObj.endDate);
                currentObj.values = [];
                var obj = {
                    from: "/Date(" + new Date(sDate).getTime() + ")/",
                    to: "/Date(" + new Date(eDate).getTime() + ")/",
                    pfrom: "/Date(" + new Date(sDate).getTime() + ")/",
                    pto: "/Date(" + new Date(eDate).getTime() + ")/",
                    label: currentObj.desc,
                    desc: "Task: " + currentObj.desc + "Date: " + trimDate(sDate) + " to " + trimDate(eDate),
                    customClass: color,
                    dataObj: Flag,
                    Predeccsors: currentObj.predecessors,
                }
                currentObj.values.push(obj);
                currentObj.startDate = currentObj.startDate;
                if (currentObj.rowNo != 1) {
                    currentObj.duration = isNaN(duration) ? "" : duration + "d";
                } else {
                    if (currentObj.duration == 0)
                        currentObj.duration = isNaN(duration) ? "" : duration + "d";
                }
                currentObj.workingDays = sDay;
                if (parentId != 0) {
                    heathPercent(parentId);
                    shortEarlyDate(parentId, Flag);
                }

            }
        }
    }
    else {
        if (Flag) {
            if (currentObj.shortStartDate != null && currentObj.shortStartDate != '' && currentObj.shortStartDate != undefined
                && currentObj.shortEndDate != null && currentObj.shortEndDate != '' && currentObj.shortEndDate != undefined)
            {
                var sDate = toDate(currentObj.shortStartDate);
                var eDate = toDate(currentObj.shortEndDate);
                var dCount = (GetDuration(sDate, eDate));
                var sDay = currentObj.workingDays;
                var dateC = toDate(currentObj.shortStartDate);
                if (parseInt(sDay) == 5) {
                    if (dateC.getDay() == 6) {
                        dateC.setDate(dateC.getDate() + 2);
                        dCount -= 2;
                    }
                }
                else if (parseInt(sDay) == 6) {
                    if (dateC.getDay() == 0) {
                        dateC.setDate(dateC.getDate() + 1);
                        dCount--;
                    }
                }
                while (dateC < eDate) {
                    dateC.setDate(dateC.getDate() + 1);
                    if (parseInt(sDay) == 5) {
                        if (dateC.getDay() == 6) {
                            dateC.setDate(dateC.getDate() + 2);
                            dCount -= 2;
                        }
                    }
                    else if (parseInt(sDay) == 6) {
                        if (dateC.getDay() == 0) {
                            dateC.setDate(dateC.getDate() + 1);
                            dCount--;
                        }
                    }
                }
                var dCounts = SumCountofCount(currentObj.id);
                if (dCounts != 0) {
                    dCount = dCounts;
                }
                if (currentObj.rowCount == 1) {
                    dCount = SumCountofCount(currentObj.id);
                    dCount = nextCount;
                }
                var VarrianceCounts = VarrianceCount(currentObj.id);
                if (VarrianceCounts != 0) {

                    if (parseInt(VarrianceCounts) < 0) {
                        currentObj.variance = parseInt(VarrianceCounts) * -1;
                    } else {
                        currentObj.variance = VarrianceCounts;
                    }
                }
                currentObj.duration = dCount + "d";
                currentObj.noofdays = dCount;
                var D2 = toDate(currentObj.startDate);
                var D3 = toDate(currentObj.endDate);
                currentObj.values = [];
                var obj = {
                    from: "/Date(" + new Date(sDate).getTime() + ")/",
                    to: "/Date(" + new Date(eDate).getTime() + ")/",
                    pfrom: "/Date(" + new Date(D2).getTime() + ")/",
                    pto: "/Date(" + new Date(D3).getTime() + ")/",
                    label: currentObj.desc,
                    desc: "Task: " + currentObj.desc + "Date: " + trimDate(sDate) + " to " + trimDate(eDate),
                    customClass: color,
                    dataObj: Flag,
                    Predeccsors: currentObj.predecessors,
                }
                currentObj.values.push(obj);
                if (parentId != 0) {
                    heathPercent(parentId);
                    shortEarlyDate(parentId, Flag);
                }
            }
            else {
                currentObj.duration = "";
            }
        }
        else {
            if (currentObj.startDate != null && currentObj.startDate != '' && currentObj.startDate != undefined
                && currentObj.endDate != null && currentObj.endDate != '' && currentObj.endDate != undefined) {
                var sDate = toDate(currentObj.startDate);
                var eDate = toDate(currentObj.endDate);
                var dCount = (GetDuration(sDate, eDate));
                var sDay = currentObj.workingDays;
                var dateC = toDate(currentObj.startDate);
                if (parseInt(sDay) == 5) {
                    if (dateC.getDay() == 6) {
                        dateC.setDate(dateC.getDate() + 2);
                        dCount -= 2;
                    }
                }
                else if (parseInt(sDay) == 6) {
                    if (dateC.getDay() == 0) {
                        dateC.setDate(dateC.getDate() + 1);
                        dCount--;
                    }
                }
                while (dateC < eDate) {
                    dateC.setDate(dateC.getDate() + 1);
                    if (parseInt(sDay) == 5) {
                        if (dateC.getDay() == 6) {
                            dateC.setDate(dateC.getDate() + 2);
                            dCount -= 2;
                        }
                    }
                    else if (parseInt(sDay) == 6) {
                        if (dateC.getDay() == 0) {
                            dateC.setDate(dateC.getDate() + 1);
                            dCount--;
                        }
                    }
                }
                var dCounts = SumCountofCount(currentObj.id);
                if (dCounts != 0) {
                    dCount = dCounts;
                }
                if (currentObj.rowCount == 1) {
                    dCount = SumCountofCount(currentObj.id);
                    dCount = nextCount;
                }
                var VarrianceCounts = VarrianceCount(currentObj.id);
                if (VarrianceCounts != 0) {

                    if (parseInt(VarrianceCounts) < 0) {
                        currentObj.variance = parseInt(VarrianceCounts) * -1;
                    } else {
                        currentObj.variance = VarrianceCounts;
                    }
                }
                currentObj.duration = dCount + "d";
                currentObj.noofdays = dCount;
                currentObj.values = [];
                var SD = splitSlash(currentObj.startDate);
                var ED = splitSlash(currentObj.endDate);
                if (sDay == "")
                    sDay = currentObj.slDate;
                var health = SetHealthValue(SD, ED, currentObj.taskStatus, sDay, parentId);
                if (health != undefined) {
                    currentObj.health = health.color;
                    currentObj.percentComplete = health.percentage != "" ? health.percentage + "%" :"";
                }

                var obj = {
                    from: "/Date(" + new Date(sDate).getTime() + ")/",
                    to: "/Date(" + new Date(eDate).getTime() + ")/",
                    pfrom: "/Date(" + new Date(sDate).getTime() + ")/",
                    pto: "/Date(" + new Date(eDate).getTime() + ")/",
                    label: currentObj.desc,
                    desc: "Task: " + currentObj.desc + "Date: " + trimDate(sDate) + " to " + trimDate(eDate),
                    customClass: color,
                    dataObj: Flag,
                    Predeccsors: currentObj.predecessors,
                }
                
                currentObj.values.push(obj);
                if(parentId != 0) {
                    heathPercent(parentId);
                    shortEarlyDate(parentId, Flag);
                }
            }
            else {
                currentObj.duration = "";
            }
        }
    }
    return currentObj;
}
//***************************************END*****************************
//TASKNAME, PREDESSOR, DELAY COMMENTS AND TASK MANAGER CALCUALTION
function BindDataOnChange(rowCount, parentId, Id, Input, Flag, Comments, elements) {
    var OnFoucsData = bindOnFocus(Comments);
    var newCount = rowCount.rowCount;
    if (newCount != undefined)
        sessionStorage.setItem("RowCount", OnFoucsData + newCount);
    else
        sessionStorage.setItem("RowCount", OnFoucsData + rowCount);

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].rowCount == rowCount) {
            arrayGantt[selectedIndex] = AssignValue(arrayGantt[selectedIndex], Input, Flag);
            break;
        }
        else {
            arrayGantt[selectedIndex].subTask = BindDataInSubTree(arrayGantt[selectedIndex].subTask, rowCount, parentId, Id, Input, Flag, elements);
        }
    }
    LoadChart();
    //Updatedata();    

}
//VARRIANCE ,PERCENTAGE,AND PREDECSORS BINDING FUCNTION IN BELOW
function BindDataInSubTree(arr, rowCount, parentId, Id, Input, Flag, elements) {
    var SiblingEnddate = "";
    var siblingStart = "";
    var rowNo = "";
    var Days = "";
    var predicType = "";
    var selectRow = "";
    if (elements != undefined) {
        var count = elements.txtRow;
        Flag = elements.Flag;
        rowNo = elements.rowCount;
        Days = elements.lagCount;
        predicType = elements.typePredic;
        selectRow = elements.secRowFinds;
        if (Days == "" || Days == undefined)
            Days = "0";
    }
    var PredessorCount = 0;
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (count === undefined || count == null || count.length <= 0 || count == "") {
                var duration = $("#duration_" + rowCount).val();
                PredessorCount = $("#predecessors_" + rowCount).val();
                if (duration != "") {
                    if (parseInt(duration) > 0) {
                        if (arr[i].rowCount == rowCount) {
                            arr[i] = AssignValue(arr[i], Input, Flag);
                            shortEarlyDate(parentId, Flag);
                        }
                        duration = DurationCount(arr[i].id, duration, rowCount);
                        Higduration = duration;
                        if (duration != 0) {
                            arr[i].duration = duration + 'd';
                            arr[i].upDate = 1;
                        }
                        var BaseCount = getnewDuration(Higduration, arr[i].id, rowCount);
                        Total(BaseCount);
                    }
                }
                var MaxDate = siblingMaxDate(PredessorCount, Flag);
                siblingStart = MaxDate[0];
                SiblingEnddate = MaxDate[1];
                for (var j = 0; j < PredessorCount.length; j++) {
                    var CommonCount = PredessorCount[j];
                    if (arr[i].rowCount == CommonCount) {
                        var siblingRowCount = arr[i].rowCount;
                        if (SiblingEnddate != "" && siblingStart != "") {
                            if (arr[i].predecessors != arr[i].rowCount) {
                                SamePredecssorCheck(PredessorCount, rowCount);
                                preValidate(arr[i].id, rowCount, Days, SiblingEnddate, siblingRowCount, predicType, siblingStart, selectRow, CommonCount, Flag);
                            } else {
                                alert("Circular dependency");
                                arr[i].predecessors = "";
                            }
                        }
                        else {
                            alert("No Date Found");
                            arr[i].predecessors = "";
                        }
                    }
                    else if (arr[i].rowCount == rowCount) {
                        if (PredessorCount == "") {
                            arr[i].predecessors = "";
                            AssignValues(arr[i]);
                            arr[i].upDate = 1;
                        }
                    }

                }
            }
            else {
                if (arr[i].rowCount == count) {
                    var SiblingEnddate = elements.SiblingED;
                    var siblingRowCount2 = arr[i].rowCount;
                    var siblingStart = elements.SiblingSD;
                    if (SiblingEnddate != "" && siblingStart != "") {
                        if (arr[i].predecessors != arr[i].rowCount) {
                            SamePredecssorCheck(count, rowNo);
                            preValidate(arr[i].id, rowNo, Days, SiblingEnddate, siblingRowCount2, predicType, siblingStart, selectRow, PredessorCount, Flag);
                        }
                    }
                    else {
                        alert("No Date Found");
                        arr[i].predecessors = "";
                    }
                }
                if (arr[i].rowCount == rowCount) {
                    arr[i].upDate = 1;
                    if (count === undefined || count == null || count.length <= 0 || count == "") {
                        var duration = $("#duration_" + rowCount).val();
                        if (duration != "") {
                            if (parseInt(duration) > 0) {
                                arr[i] = AssignValue(arr[i], Input, Flag);
                                shortEarlyDate(parentId, Flag);
                            }
                            else {
                                alert("No special Characters allowed here");
                            }
                        } else {
                            AssignValues(arr[i]);
                        }
                    }
                    else {
                        arr[i] = AssignValue(arr[i], Input, Flag);
                        shortEarlyDate(parentId, Flag);
                    }
                }
            }
            arr[i].subTask = BindDataInSubTree(arr[i].subTask, rowCount, parentId, Id, Input, Flag, elements);
        }
    }
    return arr;
}
function siblingMaxDate(PredessorCount, Flag) {
    var earliestDate = [];
    var stratEarly = [];
    var SiblingEnddate = "";
    var siblingStart = "";

    PredessorCount = recheckData(PredessorCount);
    for (var k = 0; k < PredessorCount.length; k++) {
        if (Flag) {
            SiblingEnddate = $('#shortEndDate_' + PredessorCount[k].textCount).val();
            siblingStart = $('#shortStartDate_' + PredessorCount[k].textCount).val();
        } else {
            SiblingEnddate = $('#dpEndDate_' + PredessorCount[k].textCount).val();
            siblingStart = $('#dpStDate_' + PredessorCount[k].textCount).val();
        }
        if (SiblingEnddate != undefined && siblingStart != undefined && SiblingEnddate != "" && siblingStart != "") {
            var ED = SiblingEnddate;
            earliestDate.push(toDate(ED));
            var SD = siblingStart;
            stratEarly.push(toDate(SD));
        }

    } if (earliestDate.length > 0) {
        var earliest = new Date(Math.max.apply(null, earliestDate));
        SiblingEnddate = formatDate(earliest);
    }
    if (stratEarly.length > 0) {
        var startest = new Date(Math.max.apply(null, stratEarly));
        siblingStart = formatDate(startest);
    }
    return [siblingStart, SiblingEnddate];
}
function getTaskNameParam(Inc) {
    var rowCount = parseInt($('#rowVal' + Inc + '').val());
    var data = BindDropDownValue(rowCount);
    $('#myDropDownLisTId' + Inc + '').append($("<option selected></option>").val(rowCount).html(data));
    selectValues = { "Finish-to-start": "Finish-to-start(FS)", "Finish-to-Finish": "Finish-to-Finish(FF)", "Start-to-Finish": "Start-to-Finish(SF)", "Start-to-Start": "Start-to-Start(SS)" };
    $('#myDropBox' + Inc + '').html("");
    $.each(selectValues, function (key, value) {
        $('#myDropBox' + Inc + '')
            .append($("<option></option>")
                .attr("value", key)
                .text(value));
    });

    secRow = Inc;
    return Inc;
}
function AssignValues(taskObj) {
    var TaskManger = $("#TaskManger" + taskObj.rowCount).val();
    var projectName = $("#projectName_" + taskObj.rowCount).val();
    var delayComment = $("#delayComment" + taskObj.rowCount).val();
    // var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    var predec = $("#predecessors_" + taskObj.rowCount).val();
    if (predec != "")
        taskObj.predecessors = predec;
    else {
        taskObj.predecessors = "";
    }
    if (TaskManger != "") {
        taskObj.taskManager = TaskManger;
    }
    if (delayComment != "") {
        taskObj.delayComments = delayComment;

    } else {
        taskObj.delayComments = "";
    } if (projectName != "") {
        taskObj.name = projectName;

    } else {
        taskObj.name = "";
    }
    taskObj.upDate = 1;
    return taskObj;
}
//ACTUAL END DATE CHANGE TO DURATION CALCULATION
function AssignValue(taskObj, Input, Flag) {
    taskObj.upDate = 1;
    var projectName = $("#projectName_" + taskObj.rowCount).val();
    if (projectName != "")
        taskObj.name = projectName;
    else {
        taskObj.name = "";
    }
    taskObj.duration = $("#duration_" + taskObj.rowCount).val();
    var predec = $("#predecessors_" + taskObj.rowCount).val();

    taskObj.delayComments = $("#delayComment" + taskObj.rowCount).val();
    if (Flag) {
        var userdate = taskObj.shortStartDate;
        if (userdate != "") {
            var startSplitDate = splitSlash(userdate);
            var noofdays = taskObj.duration;
            var splitNo = noofdays.split('d');
            var durationDay = parseInt(splitNo[0]);
            var startDate = startSplitDate;
            startDate = new Date(startDate.replace(/-/g, "/"));
            var endDate = "", noOfDaysToAdd = durationDay, count = 0;
            endDate = new Date(startDate);
            while (count < noOfDaysToAdd) {
                if (taskObj.workingDays == 5) {
                    if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                        count++;
                    }
                }
                else if (taskObj.workingDays == 6) {
                    if (endDate.getDay() != 0) {
                        count++;
                    }
                }
                else {
                    count++;
                }
                endDate.setDate(endDate.getDate() + 1);
            }
            endDate.setDate(endDate.getDate() - 1);
            taskObj.shortEndDate = formatDate(endDate);
            if (Input == 1)
                predecChange(taskObj, taskObj.shortStartDate, 0, taskObj.shortEndDate, Flag);

            var health = SetHealthValue(splitSlash(taskObj.shortStartDate), splitSlash(taskObj.shortEndDate), taskObj.taskStatus, taskObj.workingDays, taskObj.parentId);
            if (health != undefined) {
                var crntDate = new Date();
                var SD = new Date(taskObj.short);
                if (SD > crntDate) {
                    taskObj.percentComplete = "";
                    taskObj.color = "red";
                } else {
                    if (health.percentage > 100) {
                        health.percentage = 100;
                    }
                    if (health.percentage != "")
                        taskObj.percentComplete = health.percentage + "%";
                    else
                        taskObj.percentComplete = "";
                    taskObj.color = health.color;
                }
            }
            if (taskObj.parentId != 0) {
                heathPercent(taskObj.parentId);
            }

        }
        else {
            alert("No Date Found");
            taskObj.predecessors = "";
            taskObj.duration = "";
        }

        taskObj.values = [];
        relatedDayPredecssors(taskObj.rowCount, taskObj.shortEndDate, Flag);

        if (predec != "")
            taskObj.predecessors = predec;
        else
            taskObj.predecessors = "";


        var Object = ObjPush(taskObj.shortStartDate, taskObj.shortEndDate, taskObj.startDate, taskObj.endDate, taskObj.desc, taskObj.predecessors, Flag);
        taskObj.values.push(Object);
    }
    else {
        var userdate = taskObj.startDate;
        if (userdate != "") {
            var startSplitDate = splitSlash(userdate);
            var noofdays = taskObj.duration;
            var splitNo = noofdays.split('d');
            var durationDay = parseInt(splitNo[0]);
            var startDate = startSplitDate;
            startDate = new Date(startDate.replace(/-/g, "/"));
            var endDate = "", noOfDaysToAdd = durationDay, count = 0;
            endDate = new Date(startDate);
            while (count < noOfDaysToAdd) {
                if (taskObj.workingDays == 5) {
                    if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                        count++;
                    }
                }
                else if (taskObj.workingDays == 6) {
                    if (endDate.getDay() != 0) {
                        count++;
                    }
                }
                else {
                    count++;
                }
                endDate.setDate(endDate.getDate() + 1);
            }
            endDate.setDate(endDate.getDate() - 1);
            taskObj.endDate = formatDate(endDate);
            if (Input == 1)
                predecChange(taskObj, taskObj.startDate, 0, taskObj.endDate, Flag);
            if (taskObj.workingDays == "" || taskObj.workingDays == undefined)
                taskObj.workingDays = taskObj.slDate;
            var health = SetHealthValue(splitSlash(taskObj.startDate), splitSlash(taskObj.endDate), taskObj.taskStatus, taskObj.workingDays, taskObj.parentId);
            if (health != undefined) {
                
                taskObj.percentComplete = health.percentage != "" ? health.percentage + "%" : "";
                taskObj.color = health.color;
                taskObj.health = health.color;
            }
            // taskObj.predecessors = predec;
            if (taskObj.parentId != 0) {
                heathPercent(taskObj.parentId);
            }
        }
        else {
            alert("No Date Found");
            taskObj.predecessors = "";
            taskObj.duration = "";
        }
        taskObj.values = [];
        relatedDayPredecssors(taskObj.rowCount, taskObj.endDate, Flag);
        if (predec != "")
            taskObj.predecessors = predec;
        else
            taskObj.predecessors = "";

        var Object = ObjPush(taskObj.startDate, taskObj.endDate, taskObj.shortStartDate, taskObj.shortEndDate, taskObj.desc, taskObj.predecessors, Flag);
        taskObj.values.push(Object);
    }
    return taskObj;
}
// Get the value in tasktype from the dropdown
function prdicVal(rowCount) {
    dpval = $('#myDropBox' + rowCount + ' option:selected').val();
    InitialVal = $('#myDropBox' + secRow + ' option:selected').val();
    return dpval;
}
function htmlPopup(rowCount) {
    var row = '<tr><td><input type="text" style="width: 7rem;" id="rowVal' + Inc + '" onchange="getTaskNameParam(' + Inc + ')" class="form-control-sm prd' + rowCount + '" value=""></input></td><td><select id ="myDropDownLisTId' + Inc + '" style ="width: 9rem;" class="form-control-sm prdT=' + rowCount + '"> <option></option></select></td><td><select id="myDropBox' + Inc + '" style="width: 120px;"  onchange="prdicVal(' + Inc + ')" class="form-control-sm prdS' + rowCount + '"> <option>------------------</option><option value ="Finish-to-start"> Finish-to-start(FS)</option><option value="Finish-to-Finish">Finish-to-Finish(FF)</option><option value="Start-to-Start">Start-to-Start(SS)</option><option value="Start-to-Finish">Start-to-Finish(SF)</option></select></td><td><input type="text" id="lagVal' + Inc + '" style="width: 3rem;" class="form-control-sm prdL' + rowCount + '"></td>  <td> <a onclick="Add(' + rowCount + ')"> <i class="fa fa-plus" style="font-size:28px;color:blue"></i></a></td></tr>';
    Inc++;
    $("#newRow").append(row);
}
// MODEL_POPUP ON PREDECSSORS 
function modelPopup(rowCount) {
    $("#newRow").html("");
    var html = "<tr><th> <span>ROW</span></th><th> <span>Task</span></th><th> <span>Type</span></th><th> <span>Lag</span></th></tr>";
    $("#newRow").html(html);
    var predecessor = $("#predecessors_" + rowCount).val();
    if (predecessor == "") {
        htmlPopup(rowCount);
    }
    if (predecessor != "") {
        var splitPred = predecessor.split(",");
        for (var i = 0; i < splitPred.length; i++) {
            var disable = false;
            if (splitPred[i].indexOf("-") > 0) {
                var spliteachpred = splitPred[i].split("-");
                disable = true;
            }
            else
                var spliteachpred = splitPred[i].split("+");

            if (splitPred[i] != "") {
                for (var j = 0; j < spliteachpred.length; j++) {
                    var str1 = spliteachpred[j];
                    var str2 = "FS";
                    var Bool = false;
                    if (str1.indexOf(str2) != -1) {
                        Bool = true;
                        BindDropDownPopup(rowCount, i, str2, str1, Bool, disable, spliteachpred);
                        break;
                    }
                    str2 = "FF";
                    if (str1.indexOf(str2) != -1) {

                        Bool = true;
                        BindDropDownPopup(rowCount, i, str2, str1, Bool, disable, spliteachpred);
                        break;
                    }
                    str2 = "SS";
                    if (str1.indexOf(str2) != -1) {
                        Bool = true;
                        BindDropDownPopup(rowCount, i, str2, str1, Bool, disable, spliteachpred);
                        break;
                    }
                    str2 = "SF";
                    if (str1.indexOf(str2) != -1) {
                        Bool = true;
                        BindDropDownPopup(rowCount, i, str2, str1, Bool, disable, spliteachpred);
                        break;
                    }
                    if (!Bool) {
                        Bool = false;
                        BindDropDownPopup(rowCount, i, str2, str1, Bool, disable, spliteachpred);
                    }
                }
            }

        }
    }
    $('#myModal').modal('show');
    var data = BindDropDownValue(rowCount);
    dropValueCurrent = data;
    $("#myDropDownLisTId").append($("<option selected></option>").val(data).html(data));
    globalVarribal = rowCount;
}
function IdentifyPredic(data, i, rowCount) {
    var stringData = "";
    switch (data) {
        case 'FS':
            stringData = "Finish-to-start";
            var row = '<tr><td><input type="text" style="width: 7rem;" id="rowVal' + i + '" onchange="getTaskNameParam(' + i + ')" class="form-control-sm prd' + rowCount + '" value=""></input></td><td><select id ="myDropDownLisTId' + i + '" style ="width: 9rem;" class="form-control-sm prdT=' + i + '"> <option></option></select></td><td><select id="myDropBox' + i + '" style="width: 120px;" onchange="prdicVal(' + i + ')"class="form-control-sm prdS' + rowCount + '"> <option>------------------</option><option value="Finish-to-Finish">Finish-to-Finish(FF)</option><option value="Start-to-Start">Start-to-Start(SS)</option><option value="Start-to-Finish">Start-to-Finish(SF)</option></select></td><td><input type="text" id="lagVal' + i + '" style="width: 3rem;" class="form-control-sm prdL' + rowCount + '"></td>  <td> <a onclick="Add(' + rowCount + ')"> <i class="fa fa-plus" style="font-size:28px;color:blue"></i></a></td></tr>';
            $("#newRow").append(row);
            break;
        case 'FF':
            stringData = "Finish-to-Finish";
            var row = '<tr><td><input type="text" style="width: 7rem;" id="rowVal' + i + '" onchange="getTaskNameParam(' + i + ')" class="form-control-sm prd' + rowCount + '" value=""></input></td><td><select id ="myDropDownLisTId' + i + '" style ="width: 9rem;" class="form-control-sm prdT=' + i + '"> <option></option></select></td><td><select id="myDropBox' + i + '" style="width: 120px;" onchange="prdicVal(' + i + ')" class="form-control-sm prdS' + rowCount + '"> <option>------------------</option><option value ="Finish-to-start"> Finish-to-start(FS)</option><option value="Start-to-Start">Start-to-Start(SS)</option><option value="Start-to-Finish">Start-to-Finish(SF)</option></select></td><td><input type="text" id="lagVal' + i + '" style="width: 3rem;" class="form-control-sm prdL' + rowCount + '"></td>  <td> <a onclick="Add(' + rowCount + ')"> <i class="fa fa-plus" style="font-size:28px;color:blue"></i></a></td></tr>';
            $("#newRow").append(row);
            break;
        case 'SF':
            stringData = "Start-to-Finish";
            var row = '<tr><td><input type="text" style="width: 7rem;" id="rowVal' + i + '" onchange="getTaskNameParam(' + i + ')" class="form-control-sm prd' + rowCount + '" value=""></input></td><td><select id ="myDropDownLisTId' + i + '" style ="width: 9rem;" class="form-control-sm prdT=' + i + '"> <option></option></select></td><td><select id="myDropBox' + i + '" style="width: 120px;" onchange="prdicVal(' + i + ')" class="form-control-sm prdS' + rowCount + '"> <option>------------------</option><option value ="Finish-to-start"> Finish-to-start(FS)</option><option value="Finish-to-Finish">Finish-to-Finish(FF)</option><option value="Start-to-Start">Start-to-Start(SS)</option></select></td><td><input type="text" id="lagVal' + i + '" style="width: 3rem;" class="form-control-sm prdL' + rowCount + '"></td>  <td> <a onclick="Add(' + rowCount + ')"> <i class="fa fa-plus" style="font-size:28px;color:blue"></i></a></td></tr>';
            $("#newRow").append(row);
            break;
        case 'SS':
            stringData = "Start-to-Start";
            var row = '<tr><td><input type="text" style="width: 7rem;" id="rowVal' + i + '" onchange="getTaskNameParam(' + i + ')" class="form-control-sm prd' + rowCount + '" value=""></input></td><td><select id ="myDropDownLisTId' + i + '" style ="width: 9rem;" class="form-control-sm prdT=' + i + '"> <option></option></select></td><td><select id="myDropBox' + i + '" style="width: 120px;" onchange="prdicVal(' + i + ')" class="form-control-sm prdS' + rowCount + '"> <option>------------------</option><option value ="Finish-to-start"> Finish-to-start(FS)</option><option value="Finish-to-Finish">Finish-to-Finish(FF)</option><option value="Start-to-Finish">Start-to-Finish(SF)</option></select></td><td><input type="text" id="lagVal' + i + '" style="width: 3rem;" class="form-control-sm prdL' + rowCount + '"></td>  <td> <a onclick="Add(' + rowCount + ')"> <i class="fa fa-plus" style="font-size:28px;color:blue"></i></a></td></tr>';
            $("#newRow").append(row);
            break;
    }
    return stringData;
}
function BindDropDownPopup(rowCount, i, str2, str1, Bool, disable, spliteachpred) {
    if (!Bool) {
        var row = '<tr><td><input type="text" style="width: 7rem;" id="rowVal' + i + '" onchange="getTaskNameParam(' + i + ')" class="form-control-sm prd' + rowCount + '" value=""></input></td><td><select id ="myDropDownLisTId' + i + '" style ="width: 9rem;" class="form-control-sm prdT=' + i + '"> <option></option></select></td><td><select id="myDropBox' + i + '" style="width: 120px;" onchange="prdicVal(' + i + ')" class="form-control-sm prdS' + rowCount + '"> <option>------------------</option><option value ="Finish-to-start"> Finish-to-start(FS)</option><option value="Finish-to-Finish">Finish-to-Finish(FF)</option><option value="Start-to-Start">Start-to-Start(SS)</option><option value="Start-to-Finish">Start-to-Finish(SF)</option></select></td><td><input type="text" id="lagVal' + i + '" style="width: 3rem;" class="form-control-sm prdL' + rowCount + '"></td>  <td> <a onclick="Add(' + rowCount + ')"> <i class="fa fa-plus" style="font-size:28px;color:blue"></i></a></td></tr>';
        $("#newRow").append(row);
        $("#rowVal" + i).val(str1.replace(str2, ""));
        var check = str1.replace(str2, "");
        var data = BindDropDownValue(parseInt(check));
        $("#myDropBox" + i).append($("<option selected></option>").val('').html(''));
        $("#myDropDownLisTId" + i).append($("<option selected></option>").val(data).html(data));
        var split = spliteachpred[spliteachpred.length - 1];
        split = split.split("");
        if (split[1] == "d" || split[2] == "d") {
            if (disable)
                $("#lagVal" + i).val('-' + spliteachpred[spliteachpred.length - 1]);
            else
                $("#lagVal" + i).val(spliteachpred[spliteachpred.length - 1]);
        } else {
            $("#lagVal" + i).val("");
        }
    }
    else {
        var stringType = IdentifyPredic(str2, i, rowCount);
        $("#rowVal" + i).val(str1.replace(str2, ""));
        var check = str1.replace(str2, "");
        var data = BindDropDownValue(parseInt(check));
        $("#myDropBox" + i).append($("<option selected></option>").val(stringType).html(stringType));
        $("#myDropDownLisTId" + i).append($("<option selected></option>").val(data).html(data));
        var split = spliteachpred[spliteachpred.length - 1];
        split = split.split("");
        if (split[1] == "d" || split[2] == "d") {
            if (disable)
                $("#lagVal" + i).val('-' + spliteachpred[spliteachpred.length - 1]);
            else
                $("#lagVal" + i).val(spliteachpred[spliteachpred.length - 1]);
        } else {
            $("#lagVal" + i).val("");
        }
    }
}
//BASE LINE MODEL POPUP
function baseClick() {

    $('#baseLine').modal('show');
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].rowCount == 1) {
            var baseDate = "";
            if (arrayGantt[selectedIndex].subTask[selectedIndex].rowCount == 2) {
                baseDate = arrayGantt[selectedIndex].subTask[selectedIndex].planBaseLine;
            }
            if (baseDate == "True" || baseDate == true) {
                baseDate = true;
            } else {
                baseDate = arrayGantt[selectedIndex].planBaseLine;
            }

            if (baseDate == "True" || baseDate == true) {

                $("#hideSubmit").hide();
                $("#hideReset").show();
            }
            else {
                $("#hideReset").hide();
                $("#hideSubmit").show();
            }

            break;
        }
        LoadChart();
    }
    var rowCount = 1;
    var data = baseLineOnClick(rowCount);
    if (isNaN(basdays)) {
        basdays = 0;
    }
    var daysVarriance = basdays;
    $("#lableS").val(daysVarriance).text(data[0].startDate);
    $("#lableE").val(daysVarriance).text(data[0].endDate);
    if (data[0].planStart != "" && data[0].planEnd != "") {
        var planstart = moment(data[0].planStart).utc().format('DD-MM-YYYY');
        planstart = $("#lableP").val(daysVarriance).text(planstart);
        var Planend = moment(data[0].planEnd).utc().format('DD-MM-YYYY');
        Planend = $("#lablePd").val(daysVarriance).text(Planend);
    } else {
        $("#lableP").val("").text("----------");
        $("#lablePd").val("").text("----------");
    }
    $("#labelVarriance").val(daysVarriance).text(daysVarriance);
}
function baseLineOnClick(rowCount) {
    var BasLine = [];
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].rowCount == rowCount) {
            var basObj =
            {
                startDate: arrayGantt[selectedIndex].startDate,
                endDate: arrayGantt[selectedIndex].endDate,
                planStart: arrayGantt[selectedIndex].planedStartDate,
                planEnd: arrayGantt[selectedIndex].planedEndDate
            };
            basdays = varinaceCalculation(basObj);
            BasLine.push(basObj);
        }
    }
    return BasLine;
}
function varinaceCalculation(arr) {
    var planEndate = moment(arr.planEnd).utc().format('MM-DD-YYYY');
    var endDate = arr.endDate;
    var f = endDate.split('-');
    endDate = f[1] + '-' + f[0] + '-' + f[2];
    var startCal = new Date(planEndate);
    var endCal = new Date(endDate);
    var diff = new Date(endCal - startCal);
    var days = diff / 1000 / 60 / 60 / 24;
    return days;
}
var BaseForm = function () {
    var BaseLineForm = false;
    for (var i = 0; i < arrayGantt.length; i++) {
        if (arrayGantt[i].subTask[i].subTask[i].planBaseLine == true || arrayGantt[i].subTask[i].subTask[i].planBaseLine == "True") {
            BaseLineForm = true;
            break;
        } else {
            BaseLineForm = false;
            break;
        }
    }
    return BaseLineForm;
}
function preArrayForm(predicTypeData, textCount, lagCounts, BaseLineForm) {
    var preArray = [];
    var EarlyEnd = [];
    var EarlyStart = [];
    var count = 0;
    var secRowFind = secRow;
    var txtRowCount = "";
    var lagCount = "";
    var predicType = "";
    var SiblingEnddate = "";
    var siblingStart = "";
    var emptyFlag = false;
    for (var i = 0; i < predicTypeData.length; i++) {
        predicType = predicTypeData[i];
        txtRowCount = textCount[i];
        lagCount = lagCounts[i];
        if (BaseLineForm) {
            SiblingEnddate = $('#shortEndDate_' + txtRowCount).val();
            siblingStart = $('#shortStartDate_' + txtRowCount).val();
        }
        else {
            SiblingEnddate = $('#dpEndDate_' + txtRowCount).val();
            siblingStart = $('#dpStDate_' + txtRowCount).val();
        }
        if (SiblingEnddate != undefined && siblingStart != undefined && SiblingEnddate != "" && siblingStart != "") {
            var ED = SiblingEnddate;
            EarlyEnd.push(toDate(ED));
            var SD = siblingStart;
            EarlyStart.push(toDate(SD));
        }

        if (EarlyEnd.length > 0) {
            var earliest = new Date(Math.max.apply(null, EarlyEnd));
            if (earliest != "Invalid Date")
                emptyFlag = true;
            SiblingEnddate = formatDate(earliest);
        }
        if (EarlyStart.length > 0) {
            var startest = new Date(Math.max.apply(null, EarlyStart));
            if (earliest != "Invalid Date")
                emptyFlag = true;
            siblingStart = formatDate(startest);
        }
        var HighIndex = "";
        var LowIndex = "";
        for (var y = 0; y < EarlyEnd.length; y++) {
            if (EarlyEnd[y].toString() == earliest.toString()) {
                HighIndex = y;
                break;
            }
        }
        for (var y = 0; y < EarlyStart.length; y++) {
            if (EarlyStart[y].toString() == startest.toString()) {
                LowIndex = y;
                break;
            }
        }

        predicType = predicTypeData[HighIndex];
        if (predicType == "Finish-to-start" || predicType == "Finish-to-Finish") {
            predicType = predicTypeData[HighIndex];
        }
        else {
            if (predicTypeData.indexOf('Finish-to-start') > -1) {
                predicType = "Finish-to-start";
            } else {
                predicType == predicTypeData[LowIndex];
            }
        }

        var preObjects =
        {
            txtRow: txtRowCount,
            lagCount: lagCount,
            rowCount: globalVarribal,
            typePredic: predicType,
            secRowFinds: secRowFind,
            SiblingSD: siblingStart,
            SiblingED: SiblingEnddate,
            Flag: BaseLineForm,
            Invalid: emptyFlag,
        }
        preArray.push(preObjects);
        count++;
    }
    var ConsolidateFlag = false;
    for (var m = 0; m < preArray.length; m++) {
        if (parseInt(preArray[m].lagCount) > 0) {
            ConsolidateFlag = true;
            break;
        }
    }
    if (ConsolidateFlag) {
        var Count = preArray[preArray.length - 1].lagCount;
        var Split = Count.split('-');
        for (var m = 0; m < Split.length; m++) {
            if (Split[m] != "")
                preArray[preArray.length - 1].lagCount = Split[m];
        }

    }
    return preArray;
}
// MODEL POPUP SUBMIT FUNCTION
function rowFind() {
    $('#myModal').modal('hide');
    var predicTypeData = genricPredic();
    var textCount = gettextpredic();
    var lagCounts = getLagpredic();
    var BaseLineForm = BaseForm();
    var preArray = preArrayForm(predicTypeData, textCount, lagCounts, BaseLineForm);
    BindDataOnChange(0, 0, 0, 0, 0, 0, preArray.pop());
}
function dateModify(date) {
    var check = "";
    if (date != "") {
        var split = date.split("/");
        const d = new Date(split);
        check = String('0' + d.getDate()).toString().slice(-2) + "-" + ('0' + (d.getMonth() + 1)).toString().slice(-2) + "-" + d.getFullYear();
    } else {
        check = "";
    }
    return check;
}
function PlanDateCalculation(arr, rowNo, selectedInput, ShortStart, ShortEnd, headId, Flag, color, sDay, sTaskStatus) {
    var earliestDates = [];
    var latestDates = [];
    $.each(arr.subTask, function (index, value) {
        if (arr.subTask[index].shortStartDate != null && arr.subTask[index].shortStartDate != '' && arr.subTask[index].shortStartDate != undefined) {
            earliestDates.push(toDate(arr.subTask[index].shortStartDate));
        }
        if (arr.subTask[index].shortEndDate != null && arr.subTask[index].shortEndDate != '' && arr.subTask[index].shortEndDate != undefined) {
            latestDates.push(toDate(arr.subTask[index].shortEndDate));
        }
    });
    if (earliestDates.length > 0) {
        var earliest = new Date(Math.min.apply(null, earliestDates));
        arr.shortStartDate = trimDate(earliest);
        arr.upDate = 1;
        SubParenStart = trimDate(earliest);
    }
    else {
        arr.shortStartDate = "";
    }
    if (latestDates.length > 0) {
        var latest = new Date(Math.max.apply(null, latestDates));
        arr.shortEndDate = trimDate(latest);
        arr.upDate = 1;
        SubParenEnd = trimDate(latest);
        //check start varriance
        if (arr.shortEndDate != "" && arr.endDate) {
            if (rowNo == arr.rowCount) {
                var PlanEndate = new Date(splitSlash(arr.shortEndDate));
                var EndDate = new Date(splitSlash(arr.endDate));
                var days = dayGet(EndDate, PlanEndate);
                if (PlanEndate >= EndDate) {
                    if (parseInt(days > 0)) {
                        arr.variance = parseInt(days) * -1;
                    } else {
                        arr.variance = days;
                    }
                } else {
                    if (parseInt(days > 0)) {

                        arr.variance = days;
                    } else {
                        arr.variance = parseInt(days) * -1;
                    }
                }
            }
        } else {
            arr.variance = "";
        }

    }
    else {
        arr.shortEndDate = "";
    }
    var VarrianceCounts = VarrianceCount(arr.id);
    if (VarrianceCounts != 0) {
        if (parseInt(VarrianceCounts) < 0) {
            arr.variance = parseInt(VarrianceCounts) * -1;
        } else {
            arr.variance = VarrianceCounts;
        }
    }
    arr = CalculateSelectedObj(arr, rowNo, color, 0, selectedInput, sDay, headId, sTaskStatus, Flag);
    return arr;
}
function dayGet(PlanEndate, EndDate) {
    datecalcualtion
    var diff = new Date(EndDate - PlanEndate);
    var days = diff / 1000 / 60 / 60 / 24;

    return days;
}
//VARRAIANCE PARENT LOOP
function dateiffSplit(date) {
    var e = date.split("/");
    var endUpDay = e[0] + '-' + e[1] + '-' + e[2];
    return endUpDay;
}
// WEEKDAYS BASED ON THE CALCULATION 
function datediff(EndDate, planedEndDate, slDate) {

    var Cont = false;
    var count = 0;
    if (planedEndDate < EndDate) {
        Cont = true;
        while (planedEndDate < EndDate) {
            if (slDate == 5) {
                if (planedEndDate.getDay() != 0 && planedEndDate.getDay() != 6) {
                    count++;
                }
                planedEndDate.setDate(planedEndDate.getDate() + 1);
            }
            else if (slDate == 6) {
                if (planedEndDate.getDay() != 0) {
                    count++;
                }
                planedEndDate.setDate(planedEndDate.getDate() + 1);
            }
            else {
                count++;
                planedEndDate.setDate(planedEndDate.getDate() + 1);
            }
        }
        count = parseInt(count) * -1;
    } else {
        Cont = false;
        while (EndDate < planedEndDate) {
            if (slDate == 5) {
                if (EndDate.getDay() != 0 && EndDate.getDay() != 6) {
                    count++;
                }
                EndDate.setDate(EndDate.getDate() + 1);
            }
            else if (slDate == 6) {
                if (EndDate.getDay() != 0) {
                    count++;
                }
                EndDate.setDate(EndDate.getDate() + 1);
            }
            else {
                count++;

                EndDate.setDate(EndDate.getDate() + 1);
            }
        }

    }
    if (Cont == false) {
        if (count == "0" || count == 0)
            count = 0
        else
            count = count;
    }
    return count;
}
function ClearSplit(date) {
    var split = date.split('/');
    var dates = "";
    if (split[1] != undefined) {
        dates = split[1] + '-' + split[0] + '-' + split[2];
    } else {
        dates = date;
    }
    return dates;
}
//onFocus
function onFocus(Count) {
    var Comments = "";
    if (Count >= 0) {
        Comments = "#projectName_";
    }
    else {
        switch (Count) {
            case 1:
                Comments = "#daySelect_";
                break;
            case 2:
                Comments = "#dpStDate_";
                break;
            case 3:
                Comments = "#dpEndDate_";
                break;
            case 4:
                Comments = "#shortStartDate_";
                break;
            case 5:
                Comments = "#shortEndDate_";
                break;
        }
    }
    return Comments;
}
function bindOnFocus(Count) {
    var Comments = "";

    switch (Count) {
        case 1:
            Comments = "#duration_";
            break;
        case 2:
            Comments = "#predecessors_";
            break;
        case 3:
            Comments = "#projectName_";
            break;

    }

    return Comments;
}
function getCommonDate(sDay, rowNo, Flag) {
    if (Flag) {
        var startDate = $("#shortStartDate_" + rowNo).val();
        var endDate = $("#shortEndDate_" + rowNo).val();
        if (sDay == "6") {
            if (startDate == "")
                startDate = $("#shortStartDate_" + rowNo).val();
            else
                startDate = ClearSplit(startDate);

            if (endDate == "")
                endDate = $("#shortEndDate_" + rowNo).val();
            else
                endDate = ClearSplit(endDate);
        }
        else {
            endDate = $("#shortEndDate_" + rowNo).val();
        }
    }
    else {
        var startDate = $("#dpStDate_" + rowNo).val();
        var endDate = $("#dpEndDate_" + rowNo).val();
        if (sDay == "6") {
            if (startDate != "")
                startDate = ClearSplit(startDate);

            if (startDate == "")
                startDate = $("#dpStDate_" + rowNo).val();

            if (endDate != "")
                endDate = ClearSplit(endDate);

            if (endDate == "")
                endDate = $("#dpEndDate_" + rowNo).val();
        }
        else {
            endDate = $("#dpEndDate_" + rowNo).val();
        }
    }
    return [startDate, endDate];
}
//ACTUAL START DATE AND END DATE CALCULATION
function DateCalculation(rowNo, id, parentId, headId, selectedInput, Flag, Comment) {
    var onFocusData = onFocus(Comment);
    sessionStorage.setItem("RowCount", onFocusData + rowNo);
    var sDay = $("#daySelect_" + rowNo + " option:selected").val();
    var sTaskStatus = $("#taskStatus" + rowNo + " option:selected").val();
    var startDate = "";
    var endDate = "";
    if (Flag) {
        var CommonDay = getCommonDate(sDay, rowNo, Flag);
        startDate = CommonDay[0];
        endDate = CommonDay[1];
    }
    else {
        var CommonDay = getCommonDate(sDay, rowNo, Flag);
        startDate = CommonDay[0];
        endDate = CommonDay[1];
    }
    var srtDay = splitSlash(startDate);
    var eDay = splitSlash(endDate);
    var PassCrtDate = new Date(srtDay);
    var PassEndDate = new Date(eDay);
    if (PassCrtDate <= PassEndDate || PassEndDate == "Invalid Date") {
            //if (selectedInput == 0) {
        if (PassCrtDate != "Invalid Date" && PassEndDate != "Invalid Date") {
                //var health = SetHealthValue(srtDay, eDay, sTaskStatus, sDay, parentId);
            //}
        }
        for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
            if (arrayGantt[selectedIndex].id == headId && arrayGantt[selectedIndex].subTask.length > 0) {
                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    for (var i = 0; i < arrayGantt[selectedIndex].subTask.length; i++) {
                        arrayGantt[selectedIndex].subTask[i] = SubTaskTree(arrayGantt[selectedIndex].subTask[i], sDay, startDate, endDate, rowNo, "ganttLightBlue", selectedInput, "", parentId, 0, Flag);
                    }
                    arrayGantt[selectedIndex] = BindDates(arrayGantt[selectedIndex], rowNo, endDate, "ganttBlue", selectedInput, sDay, parentId, sTaskStatus, Flag);
                }
            }
            else if (headId == null && parentId == null && id != null) {
                if (arrayGantt[selectedIndex].id == id && arrayGantt[selectedIndex].subTask.length == 0) {
                    arrayGantt[selectedIndex].workingDays = sDay;
                    arrayGantt[selectedIndex].startDate = startDate;
                    arrayGantt[selectedIndex].endDate = endDate;
                    arrayGantt[selectedIndex] = CalculateSelectedObj(arrayGantt[selectedIndex], rowNo, "ganttBlue", 1, selectedInput, sDay, parentId, sTaskStatus, Flag);

                }
            }
        }
    }
    else {
        if (selectedInput == 1) {

            alert("The Startdate should not be greater then the end date");
        }
        else {
            if (startDate != "")
                alert("The end date should not be lesser then the start date");
            else
                alert("The start date cannot be null");
        }
    }
    console.log(JSON.stringify(arrayGantt));
    LoadChart();
}
function BindDates(arrG, rowNo, endDate, color, selectedInput, sDay, parentId, sTaskStatus, Flag) {
    var earliestDate = [];
    var latestDate = [];
    var StartDuration = [];
    if (Flag) {
        PlanDateCalculation(arrG, rowNo, selectedInput, arrG.shortStartDate, arrG.shortEndDate, parentId, Flag, color, sDay, sTaskStatus);
    }
    else {
        $.each(arrG.subTask, function (index, value) {
            if (arrG.subTask[index].startDate != null && arrG.subTask[index].startDate != '' && arrG.subTask[index].startDate != undefined)
                earliestDate.push(toDate(arrG.subTask[index].startDate));
            if (arrG.subTask[index].endDate != null && arrG.subTask[index].endDate != '' && arrG.subTask[index].endDate != undefined)
                latestDate.push(toDate(arrG.subTask[index].endDate));
        });
        if (earliestDate.length > 0) {
            var earliest = new Date(Math.min.apply(null, earliestDate));
            arrG.startDate = trimDate(earliest);
            arrG.upDate = 1;
        }
        else {
            arrG.startDate = "";
        }
        if (latestDate.length > 0) {
            var latest = new Date(Math.max.apply(null, latestDate));
            arrG.endDate = trimDate(latest);
            arrG.upDate = 1;
            var PlanEndate = new Date(splitSlash(arrG.shortEndDate));
            var EndDate = new Date(splitSlash(arrG.endDate));
            if (arrG.shortEndDate != "" && arrG.endDate != "") {
                if (parentId == arrG.parentId) {
                    var days = dayGet(EndDate, PlanEndate);
                    if (PlanEndate >= EndDate) {
                        if (parseInt(days < 0)) {
                            arrG.variance = parseInt(days) * -1;
                        } else {
                            arrG.variance = days;
                        }
                    }
                    else {
                        if (parseInt(days < 0)) {

                            arrG.variance = days;
                        } else {
                            arrG.variance = parseInt(days) * -1;
                        }
                    }
                }
            }
            else {
                arrG.variance = "";
            }
        }
        else {
            if (arrG.rowNo != 1) {
                arrG.endDate = "";
                arrG.duration = "";
            }
        }
        arrG = CalculateSelectedObj(arrG, rowNo, color, 0, selectedInput, sDay, parentId, sTaskStatus, Flag);
    }
    return arrG;
}
function BindDatePicker(slDate, rowCount) {

    if (slDate == 7) {
        $("#dpStDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy'
        });
        $("#dpEndDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy'
        });
        $("#shortStartDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy'
        });
        $("#shortEndDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy'
        });
    } else if (slDate == 6) {
        $("#dpStDate_" + rowCount).datepicker({
            beforeShowDay: function (date) {
                var day = date.getDay();
                return [(day != 0), ''];
            }
        });
        $("#dpEndDate_" + rowCount).datepicker({
            beforeShowDay: function (date) {
                var day = date.getDay();
                return [(day != 0), ''];
            }
        }); $("#shortStartDate_" + rowCount).datepicker({
            beforeShowDay: function (date) {
                var day = date.getDay();
                return [(day != 0), ''];
            }
        });
        $("#shortEndDate_" + rowCount).datepicker({
            beforeShowDay: function (date) {
                var day = date.getDay();
                return [(day != 0), ''];
            }
        });
    } else {
        $("#dpStDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy',
            beforeShowDay: $.datepicker.noWeekends
        });
        $("#dpEndDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy',
            beforeShowDay: $.datepicker.noWeekends
        }); $("#shortStartDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy',
            beforeShowDay: $.datepicker.noWeekends
        });
        $("#shortEndDate_" + rowCount).datepicker({
            dateFormat: 'dd-mm-yy',
            beforeShowDay: $.datepicker.noWeekends
        });
    }
}
//SUBLOOP FOR CALCULATE END DATE
function CalculateSubTask(subtask, color, Flag) {

    var sDay = 0;
    for (var selectedIndex = 0; selectedIndex < subtask.length; selectedIndex++) {
        //----------------SID---------------------//
        var sDate = "";
        var eDate = "";
        if (Flag) {
            sDate = toDate(subtask[selectedIndex].shortStartDate);
            eDate = toDate(subtask[selectedIndex].shortEndDate);
        } else {
            sDate = toDate(subtask[selectedIndex].startDate);
            eDate = toDate(subtask[selectedIndex].endDate);
        }
        var qDate = new Date();
        var status = subtask[selectedIndex].taskStatus;
        var slDate = subtask[selectedIndex].workingDays;
        if (slDate == "" || slDate == undefined)
            slDate = subtask[selectedIndex].slDate;

        if (sDate != "Invalid Date" && eDate != "Invalid Date") {
            var health = SetHealthValue(sDate, eDate, status, slDate, 0);
            if (health != undefined) {
                subtask[selectedIndex].health = health.color;
                var healthPercentage = health.percentage;
                //if (healthPercentage >= 100 && subtask[selectedIndex].taskStatus == "Completed") {
                if (healthPercentage < 0)
                    subtask[selectedIndex].percentComplete = "";
                else {
                   
                    subtask[selectedIndex].percentComplete = healthPercentage != "" ? healthPercentage + "%" : "";
                    subtask[selectedIndex].health = healthColorDependecies(healthPercentage, subtask[selectedIndex].taskStatus);
                }
                //}

                //else {

                //    if (healthPercentage != "" && parseInt(healthPercentage) != 0) {
                //        var colors = healthColorDependecy(healthPercentage);
                //        subtask[selectedIndex].health = colors;                    
                //        subtask[selectedIndex].percentComplete = healthPercentage + '%';
                //        subtask[selectedIndex].health = colors;

                //    } else {
                //        subtask[selectedIndex].percentComplete = "";

                //    }
                //}
                if (subtask[selectedIndex].parentId != 0) {
                    
                    subtask[selectedIndex].percentComplete = healthPercentage + '%';
                    heathPercent(subtask[selectedIndex].parentId);
                }
            }

        }
        else {
            subtask[selectedIndex].percentComplete = "";
            subtask[selectedIndex].health = "red";
        }

        sDay = subtask[selectedIndex].workingDays;
        if (Flag) {
            if (subtask[selectedIndex].shortStartDate != "" && subtask[selectedIndex].shortStartDate != null && subtask[selectedIndex].shortStartDate != undefined) {

                subtask[selectedIndex].values = [];
                var fDate = "/Date(" + new Date(toDate(subtask[selectedIndex].shortStartDate)).getTime() + ")/";
                var tDate = "/Date(" + new Date(toDate(subtask[selectedIndex].shortEndDate)).getTime() + ")/";
                var psDate = "/Date(" + new Date(toDate(subtask[selectedIndex].startDate)).getTime() + ")/";
                var peDate = "/Date(" + new Date(toDate(subtask[selectedIndex].endDate)).getTime() + ")/";

                var obj = {
                    from: fDate,
                    to: tDate,
                    pfrom: psDate,
                    pto: peDate,
                    label: subtask[selectedIndex].desc,
                    desc: "Task: " + subtask[selectedIndex].desc + ",Date: " + trimDate(toDate(subtask[selectedIndex].shortStartDate)) + " to " + trimDate(toDate(subtask[selectedIndex].shortEndDate)),
                    customClass: color,
                    Predeccsors: subtask[selectedIndex].predecessors
                }
                subtask[selectedIndex].values.push(obj);
                if (subtask[selectedIndex].subTask.length > 0) {
                    subtask[selectedIndex].subTask = CalculateSubTask(subtask[selectedIndex].subTask, "ganttGreen", Flag);
                } else {
                    var colors = "red";
                    subtask[selectedIndex].health = colors;
                    if (healthPercentage >= 100 && subtask[selectedIndex].taskStatus == "Completed") {
                        subtask[selectedIndex].percentComplete = "100%";
                        subtask[selectedIndex].health = "Green";
                    }
                    else if (healthPercentage > 100 && subtask[selectedIndex].taskStatus == "") {
                        subtask[selectedIndex].percentComplete = "100%";
                        subtask[selectedIndex].health = "Red";
                    }

                    else {
                        if (healthPercentage != "") {
                            if (parseInt(healthPercentage) < 0)
                                subtask[selectedIndex].percentComplete = "";
                            else {
                                //if (parseInt(healthPercentage) > 60 && parseInt(healthPercentage) != 100)
                                //    colors = "yellow";
                                //else if (parseInt(healthPercentage) < 60 && parseInt(healthPercentage) != 100 && parseInt(healthPercentage)!=0)
                                //    colors = "green";
                                //else if (parseInt(healthPercentage) == 100)
                                //    colors = "red";

                                subtask[selectedIndex].percentComplete = healthPercentage + '%';
                                subtask[selectedIndex].health = healthColorDependecy(healthPercentage);
                            }

                        }
                        else {
                            subtask[selectedIndex].percentComplete = healthPercentage;
                        }
                    }
                }
                if (subtask[selectedIndex].parentId != 0) {
                    heathPercent(subtask[selectedIndex].parentId);
                }
            }
            else {
                if (subtask[selectedIndex].subTask.length > 0) {
                    subtask[selectedIndex].subTask = CalculateSubTask(subtask[selectedIndex].subTask, "ganttGreen", Flag);
                } else {
                    subtask[selectedIndex].health = "red";
                    subtask[selectedIndex].percentComplete = "";
                }

                subtask[selectedIndex].shortStartDate = "";
                subtask[selectedIndex].shortEndDate = "";
            }
        }
        else {
            if (subtask[selectedIndex].startDate != "" && subtask[selectedIndex].startDate != null && subtask[selectedIndex].startDate != undefined) {

                subtask[selectedIndex].values = [];
                var fDate = "/Date(" + new Date(toDate(subtask[selectedIndex].startDate)).getTime() + ")/";
                var tDate = "/Date(" + new Date(toDate(subtask[selectedIndex].endDate)).getTime() + ")/";
                var psDate = "/Date(" + new Date(toDate(subtask[selectedIndex].shortStartDate)).getTime() + ")/";
                var peDate = "/Date(" + new Date(toDate(subtask[selectedIndex].shortEndDate)).getTime() + ")/";

                var obj = {
                    from: fDate,
                    to: tDate,
                    pfrom: psDate,
                    pto: peDate,
                    label: subtask[selectedIndex].desc,
                    desc: "Task: " + subtask[selectedIndex].desc + ",Date: " + trimDate(toDate(subtask[selectedIndex].startDate)) + " to " + trimDate(toDate(subtask[selectedIndex].endDate)),
                    customClass: color,
                    Predeccsors: subtask[selectedIndex].predecessors
                }
                subtask[selectedIndex].values.push(obj);
                if (subtask[selectedIndex].subTask.length > 0) {
                    subtask[selectedIndex].subTask = CalculateSubTask(subtask[selectedIndex].subTask, "ganttGreen", Flag);
                }
                else
                {
                    var colors = healthColorDependecies(healthPercentage, subtask[selectedIndex].taskStatus);
                   
                  /*  if (healthPercentage > 100 && subtask[selectedIndex].taskStatus == "Completed") {*/
                        subtask[selectedIndex].percentComplete = healthPercentage;
                        subtask[selectedIndex].health = colors;
                    //} else if (healthPercentage > 100 && subtask[selectedIndex].taskStatus == "") {
                        //subtask[selectedIndex].percentComplete = "100%";
                        //subtask[selectedIndex].health = "Red";
                    //}
                    // else 
                   // {
                        if (healthPercentage != "")
                        {
                            if (parseInt(healthPercentage) < 0)
                                subtask[selectedIndex].percentComplete = "";
                            else {
                                //if (parseInt(healthPercentage) > 60 && parseInt(healthPercentage) != 100)
                                //    colors = "yellow";
                                //else if (parseInt(healthPercentage) < 60 && parseInt(healthPercentage) != 100 && parseInt(healthPercentage)!=0)
                                //    colors = "green";
                                //else if (parseInt(healthPercentage) == 100)
                                //    colors = "red";
                                subtask[selectedIndex].percentComplete = healthPercentage + '%';
                                subtask[selectedIndex].health = healthColorDependecies(healthPercentage, subtask[selectedIndex].taskStatus);
                            }
                       }

                        else {
                            subtask[selectedIndex].percentComplete = healthPercentage;
                        }

                   // }
                }
                if (subtask[selectedIndex].parentId != 0) {
                    heathPercent(subtask[selectedIndex].parentId);
                }
            }
            else {
                if (subtask[selectedIndex].subTask.length > 0) {
                    subtask[selectedIndex].subTask = CalculateSubTask(subtask[selectedIndex].subTask, "ganttGreen", Flag);
                } else {
                    subtask[selectedIndex].health = "red";
                    subtask[selectedIndex].percentComplete = "";
                }
                subtask[selectedIndex].startDate = "";
                subtask[selectedIndex].endDate = "";
            }

        }
    }

    return subtask;
}
//CALCULATE END DATE
function CalculateEndDate() {
    var sDay = 0;
    var Flag = false;
    for (var i = 0; i < arrayGantt.length; i++) {
        if (arrayGantt[i].planBaseLine == true) {
            Flag = true;
            break;
        } else {
            Flag = false;
            break;
        }

    }
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if ($("#daySelect_" + selectedIndex + " option:selected").val() != undefined) {
            sDay = $("#daySelect_" + selectedIndex + " option:selected").val();
            var parentId = arrayGantt[selectedIndex].id;
            arrayGantt.forEach((element, index) => {
                if (parentId == arrayGantt[index].parentId) {
                    arrayGantt[index].workingDays = sDay;
                }
            });
        }
        else {
            sDay = arrayGantt[selectedIndex].workingDays;
        }
        if (Flag) {
            if (arrayGantt[selectedIndex].shortStartDate != "" && arrayGantt[selectedIndex].shortStartDate != null && arrayGantt[selectedIndex].shortStartDate != undefined) {

                arrayGantt[selectedIndex].values = [];
                var fDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortStartDate)).getTime() + ")/";
                var tDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortEndDate)).getTime() + ")/";
                var psDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].startDate)).getTime() + ")/";
                var peDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].endDate)).getTime() + ")/";
                var obj = {
                    from: fDate,
                    to: tDate,
                    pfrom: psDate,
                    pto: peDate,
                    label: arrayGantt[selectedIndex].desc,
                    desc: "Task: " + arrayGantt[selectedIndex].desc + ",Date: " + trimDate(toDate(arrayGantt[selectedIndex].shortStartDate)) + " to " + trimDate(toDate(arrayGantt[selectedIndex].shortEndDate)),
                    customClass: "ganttBlue",

                    Predeccsors: arrayGantt[selectedIndex].predecessors
                }
                arrayGantt[selectedIndex].values.push(obj);
                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    if (arrayGantt[selectedIndex].rowNo == 1) {
                        //var colors = "red";
                        //if (parseInt(arrayGantt[selectedIndex].percentComplete) > 60 && parseInt(arrayGantt[selectedIndex].percentComplete)!=100)
                        //    colors = "yellow";
                        //else if (parseInt(arrayGantt[selectedIndex].percentComplete) < 60 && parseInt(arrayGantt[selectedIndex].percentComplete) != 0 && parseInt(arrayGantt[selectedIndex].percentComplete)!=100)
                        //    colors = "green";
                        //else if (parseInt(arrayGantt[selectedIndex].percentComplete) == 100)
                        //    colors = "red";
                        arrayGantt[selectedIndex].health = healthColorDependecy(arrayGantt[selectedIndex].percentComplete);

                    }
                    arrayGantt[selectedIndex].subTask = CalculateSubTask(arrayGantt[selectedIndex].subTask, "ganttLightBlue", Flag);
                }
            }
            else {
                arrayGantt[selectedIndex].shortEndDate = "";
                arrayGantt[selectedIndex].shortEndDate = "";
                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    arrayGantt[selectedIndex].subTask = CalculateSubTask(arrayGantt[selectedIndex].subTask, "ganttLightBlue", Flag);
                }
                else {
                    arrayGantt[selectedIndex].health = "red";
                    arrayGantt[selectedIndex].percentComplete = "";
                }
            }
        }
        else {
            if (arrayGantt[selectedIndex].startDate != "" && arrayGantt[selectedIndex].startDate != null && arrayGantt[selectedIndex].startDate != undefined) {

                arrayGantt[selectedIndex].values = [];
                var fDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].startDate)).getTime() + ")/";
                var tDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].endDate)).getTime() + ")/";
                var psDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortStartDate)).getTime() + ")/";
                var peDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortEndDate)).getTime() + ")/";
                var obj = {
                    from: fDate,
                    to: tDate,
                    pfrom: psDate,
                    pto: peDate,
                    label: arrayGantt[selectedIndex].desc,
                    desc: "Task: " + arrayGantt[selectedIndex].desc + ",Date: " + trimDate(toDate(arrayGantt[selectedIndex].startDate)) + " to " + trimDate(toDate(arrayGantt[selectedIndex].endDate)),
                    customClass: "ganttBlue",

                    Predeccsors: arrayGantt[selectedIndex].predecessors
                }
                arrayGantt[selectedIndex].values.push(obj);
                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    if (arrayGantt[selectedIndex].rowNo == 1) {
                        //var colors = "red";
                        //if (parseInt(arrayGantt[selectedIndex].percentComplete) > 60 && parseInt(arrayGantt[selectedIndex].percentComplete)!=100)
                        //    colors = "yellow";
                        //else if (parseInt(arrayGantt[selectedIndex].percentComplete) < 60 && parseInt(arrayGantt[selectedIndex].percentComplete) != 100 && parseInt(arrayGantt[selectedIndex].percentComplete)!=0)
                        //    colors = "green";
                        //else if (parseInt(arrayGantt[selectedIndex].percentComplete) == 100)
                        //    colors = "red";
                        arrayGantt[selectedIndex].health = healthColorDependecy(arrayGantt[selectedIndex].percentComplete);

                    }
                    arrayGantt[selectedIndex].subTask = CalculateSubTask(arrayGantt[selectedIndex].subTask, "ganttLightBlue", Flag);
                }
            }
            else {
                arrayGantt[selectedIndex].startDate = "";
                arrayGantt[selectedIndex].endDate = "";
                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    arrayGantt[selectedIndex].subTask = CalculateSubTask(arrayGantt[selectedIndex].subTask, "ganttLightBlue", Flag);
                }
                else {
                    arrayGantt[selectedIndex].health = "red";
                    arrayGantt[selectedIndex].percentComplete = "";
                }
                if (arrayGantt[selectedIndex].rowNo == 1) {
                    if (arrayGantt[selectedIndex].startDate == "" && arrayGantt[selectedIndex].endDate == "") {
                        var startdate = new Date();
                        startdate = String(startdate.getDate()).padStart(2, '0') + "-" + String(startdate.getMonth()).padStart(2, '0') + "-" + startdate.getFullYear();
                        var enddate = new Date();
                        enddate = String(enddate.getDate()).padStart(2, '0') + "-" + String(enddate.getMonth()).padStart(2, '0') + "-" + enddate.getFullYear();
                        arrayGantt[selectedIndex].startDate = startdate;
                        arrayGantt[selectedIndex].endDate = enddate;

                        arrayGantt[selectedIndex].values = [];
                        var fDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].startDate)).getTime() + ")/";
                        var tDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].endDate)).getTime() + ")/";
                        var psDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].startDate)).getTime() + ")/";
                        var peDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].endDate)).getTime() + ")/";

                        var obj = {
                            from: fDate,
                            to: tDate,
                            pfrom: psDate,
                            pto: peDate,
                            label: arrayGantt[selectedIndex].desc,
                            desc: "Task: " + arrayGantt[selectedIndex].desc + ",Date: " + trimDate(toDate(arrayGantt[selectedIndex].startDate)) + " to " + trimDate(toDate(arrayGantt[selectedIndex].endDate)),
                            customClass: "red",
                            Predeccsors: arrayGantt[selectedIndex].predecessors
                        }
                        arrayGantt[selectedIndex].values.push(obj);
                    }
                }
            }

        }
        if (arrayGantt[selectedIndex].rowNo == 1) {
            if (arrayGantt[selectedIndex].shortStartDate == "" && arrayGantt[selectedIndex].shortEndDate == "") {
                var startdate = new Date();
                startdate = String(startdate.getDate()).padStart(2, '0') + "-" + String(startdate.getMonth()).padStart(2, '0') + "-" + startdate.getFullYear();
                var enddate = new Date();
                enddate = String(enddate.getDate()).padStart(2, '0') + "-" + String(enddate.getMonth()).padStart(2, '0') + "-" + enddate.getFullYear();
                arrayGantt[selectedIndex].shortStartDate = startdate;
                arrayGantt[selectedIndex].shortEndDate = enddate;

                arrayGantt[selectedIndex].values = [];
                var fDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortStartDate)).getTime() + ")/";
                var tDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortEndDate)).getTime() + ")/";
                var psDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortStartDate)).getTime() + ")/";
                var peDate = "/Date(" + new Date(toDate(arrayGantt[selectedIndex].shortEndDate)).getTime() + ")/";

                var obj = {
                    from: fDate,
                    to: tDate,
                    pfrom: psDate,
                    pto: peDate,
                    label: arrayGantt[selectedIndex].desc,
                    desc: "Task: " + arrayGantt[selectedIndex].desc + ",Date: " + trimDate(toDate(arrayGantt[selectedIndex].shortStartDate)) + " to " + trimDate(toDate(arrayGantt[selectedIndex].shortEndDate)),
                    customClass: "red",
                    Predeccsors: arrayGantt[selectedIndex].predecessors
                }
                arrayGantt[selectedIndex].values.push(obj);
            }
        }
    }
    LoadChart();
}
function healthColorDependecy(Percentage) {
    var colors = "red";
    if (parseInt(Percentage) >= 60 && parseInt(Percentage) < 100)
        colors = "yellow";
    else if (parseInt(Percentage) >= 1 && parseInt(Percentage) <= 59)
        colors = "green";
    else if (parseInt(Percentage) == 100)
        colors = "red";
    return colors;
}

function healthColorDependecies(Percentage, status) {
    var colors = "red";
    if (parseInt(Percentage) >= 60 && parseInt(Percentage) < 100)
        colors = "yellow";
    else if (parseInt(Percentage) >= 1 && parseInt(Percentage) <= 59)
        colors = "green";
    else if (parseInt(Percentage) >= 100 && status == "Completed")
        colors = "green";
    else if (parseInt(Percentage) == 100 && status != "Completed")
        colors = "red";
    return colors;
}

function heathPercent(parentId) {
    healthCount = 0;
    hCount = 0;
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            SubheathPercent(arrayGantt[selectedIndex].subTask, parentId);
        }
        if (arrayGantt[selectedIndex].rowNo == 1) {

            var health = percentCal(arrayGantt[selectedIndex].id);

            if (health != 0 && health != undefined) {
                var count = parseInt(health) / ReCount;
                count = count.toFixed(0);
                console.log("health percent 1: " + count);
                console.log("name: " + arrayGantt[selectedIndex].name);
                arrayGantt[selectedIndex].percentComplete = isNaN(count) ? "" : count + '%';
                var colors = healthColorDependecies(arrayGantt[selectedIndex].percentComplete, arrayGantt[selectedIndex].taskStatus);
                arrayGantt[selectedIndex].health = colors;
            } else {
                var colors = healthColorDependecies(arrayGantt[selectedIndex].percentComplete, arrayGantt[selectedIndex].taskStatus);
                arrayGantt[selectedIndex].percentComplete = "";
                arrayGantt[selectedIndex].health = colors;
            }
        }
    }
}
function percentCal(ParenId) {
    ReCount = 0;
    TaskCount = 0;
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            SubPercentCal(arrayGantt[selectedIndex].subTask, ParenId);
        }

    }
    return TaskCount;
}
function SubPercentCal(arr, ParenId) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == ParenId) {
                if (arr[i].percentComplete != "" && arr[i].percentComplete != '0') {
                    ReCount++;
                    var a = arr[i].percentComplete;
                    a = a.split("%");
                    TaskCount += parseInt(a[0]);
                }
            }

            SubPercentCal(arr[i].subTask, ParenId);
        }
    }
    return arr;
}
//SUB LOOP HEALTH PERCENT
function SubheathPercent(arr, parentId) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == parentId) {
                if (arr[i].percentComplete != "" && arr[i].percentComplete != '0') {
                    hCount++;
                    var a = arr[i].percentComplete;
                    a = a.split("%");
                    healthCount += parseInt(a[0]);
                }
            }

            SubheathPercent(arr[i].subTask, parentId);

        }
        for (var j = 0; j < arr.length; j++) {
            if (arr[j].id == parentId) {
                var count = parseInt(healthCount) / hCount;
                count = count.toFixed(0);
                if (parseInt(count) != 0)
                    console.log("health percent 2: " + count);
                console.log("name: " + arr[j].name); 
                    arr[j].percentComplete = isNaN(count) ? "" : count + '%';
                var colors = healthColorDependecies(arr[j].percentComplete, arr[j].taskStatus);
                
                arr[j].health = colors;

                break;
            }

            SubheathPercent(arr[j].subTask, parentId);
        }
    }
    return arr;
}
//DIFFRENCE FOR START AND END DATE FOR PERCENATGE CALCUALTION  ********************START*************
function getBusinessDatesCount(startDate, endDate, slDate) {
    let count = 0;
    var curDate = new Date(startDate);
    endDate = new Date(endDate);
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && slDate == 5)
            count++;
        else if (dayOfWeek !== 0 && slDate == 6)
            count++;
        else if (slDate == 7)
            count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}
function TodayDateGet(startDate, endDate, slDate) {
    let count = 0;
    var curDate = startDate;
    endDate = new Date(endDate);
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && slDate == 5)
            count++;
        else if (dayOfWeek !== 0 && slDate == 6)
            count++;
        else if (slDate == 7)
            count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}
function getBusinessDatesCounts(strtDate, CurntDate, slDate) {
    let count = 0;
    var strtdates = new Date(strtDate);

    while (strtdates <= CurntDate) {
        const dayOfWeek = strtdates.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && slDate == 5)
            count++;
        else if (dayOfWeek !== 0 && slDate == 6)
            count++;
        else if (slDate == 7)
            count++;
        strtdates.setDate(strtdates.getDate() + 1);
    }
    return count;
}
//DIFFRENCE FOR START AND END DATE FOR PERCENATGE CALCUALTION  **********************END**************
//SET HEALTH VALUES
function SubTaskTree(arr, sDay, startDate, endDate, rowNo, color, selectedInput, health, parentId, sTaskStatus, Flag) {

    if (arr.subTask.length > 0) {

        for (var i = 0; i < arr.subTask.length; i++) {

            arr.subTask[i] = SubTaskTree(arr.subTask[i], sDay, startDate, endDate, rowNo, "ganttGreen", selectedInput, health, parentId, sTaskStatus, Flag);
        }

        arr = BindDates(arr, rowNo, endDate, color, selectedInput, sDay, parentId, sTaskStatus, Flag);

    }
    else {

        if (rowNo == arr.rowCount) {
            if (arr.shortEndDate != '' && arr.shortEndDate != null) {
                var PDate = "";
                if (Flag) {
                    var SDate = $("#dpEndDate_" + rowNo).val();
                    PDate = splitSlash(SDate);
                    var planedEndDate = new Date(PDate);
                    var datecheup = datediff(toDate(endDate), toDate(trimDate(planedEndDate)), sDay);
                    arr.variance = isNaN(datecheup) ? "" : datecheup;
                }
                else {
                    arr.variance = "";
                }

            }
            else {
                arr.variance = "";
            }
            if (Flag) {
                if (startDate != "" && endDate != "") {
                    var FirstDate = new Date(splitSlash(startDate));
                    var LastDate = new Date(splitSlash(endDate));
                    if (FirstDate > LastDate) {
                        if (selectedInput == 1) {
                            alert("The startdate should not be greater then the end date");
                        }
                        else {
                            alert("The end date should not be lesser then the start date");
                        }
                    }
                    else {
                        arr.workingDays = sDay;
                        var lastDay = arr.shortStartDate;
                        var Endays = arr.shortEndDate;
                        arr.shortStartDate = startDate;
                        arr.shortEndDate = endDate;
                        var SD = new Date(splitSlash(endDate));
                        SD.setHours(SD.getHours() + 17);
                        SD.setMinutes(SD.getMinutes() + 30);
                        arr.upDate = 1;                       
                        predecChange(arr, lastDay, selectedInput, Endays, Flag);                     
                        sDay = sDay != "" ? sDay : arr.slDate;
                        var health = SetHealthValue(splitSlash(startDate), splitSlash(endDate), sTaskStatus, sDay, parentId);
                        if (health != undefined) {
                            var colors = healthColorDependecies(health.percentage, sTaskStatus);                          
                            arr.percentComplete = health.percentage;
                            arr.health = colors;                           
                            if (health.percentage < 0)
                                arr.percentComplete = "";                           
                            else {
                                if (health.percentage != "" && parseInt(health.percentage) != 0)
                                    arr.percentComplete = health.percentage + '%';
                                else
                                    arr.percentComplete = health.percentage + '';                               
                                }
                        }
                        if (parentId != 0) {
                            heathPercent(parentId);
                        }

                        arr = CalculateSelectedObj(arr, rowNo, color, 1, selectedInput, sDay, parentId, sTaskStatus, Flag);
                    }

                }
                else {
                    if (selectedInput == 1) {
                        if (endDate == "") {
                            arr.upDate = 1;
                            if (Flag)
                                arr.shortStartDate = startDate;
                            else
                                arr.startDate = startDate;
                        }
                    } else {
                        if (endDate == "") {
                            if (Flag) {
                                arr.shortEndDate = "";
                                arr.duration = "";
                                arr.variance = "";
                                arr.upDate = 1;
                                arr.percentComplete = "";
                            } else {
                                arr.endDate = "";
                                arr.duration = "";
                                arr.variance = "";
                                arr.upDate = 1;
                                arr.percentComplete = "";
                            }
                        }
                    }
                }
            }
            else {
                if (startDate != "" && endDate != "") {
                    var FirstDate = new Date(splitSlash(startDate));
                    var LastDate = new Date(splitSlash(endDate));
                    if (FirstDate > LastDate) {
                        if (selectedInput == 1) {
                            alert("The startdate should not be greater then the end date");
                        }
                        else {
                            alert("The end date should not be lesser then the start date");
                        }
                    } else {
                        arr.workingDays = sDay;
                        var lastDay = arr.startDate;
                        var Endays = arr.endDate;
                        arr.startDate = startDate;
                        arr.endDate = endDate;
                        var SD = new Date(splitSlash(endDate));
                        SD.setHours(SD.getHours() + 17);
                        SD.setMinutes(SD.getMinutes() + 30);
                        arr.upDate = 1;
                        var CD = new Date();
                        predecChange(arr, lastDay, selectedInput, Endays, Flag);
                        
                        if (parentId != 0) {
                            heathPercent(parentId);
                        }

                        arr = CalculateSelectedObj(arr, rowNo, color, 1, selectedInput, sDay, parentId, sTaskStatus, Flag);
                      

                    }

                }
                else {
                    if (selectedInput == 1) {
                        if (endDate == "") {
                            arr.upDate = 1;
                            arr.startDate = startDate;
                        }
                    } else {
                        if (endDate == "") {
                            arr.endDate = "";
                            arr.duration = "";
                            arr.variance = "";
                            arr.upDate = 1;
                            arr.percentComplete = "";
                        }
                    }
                }
            }

        }
    }
    return arr;
}
function SetHealthValue(sDate, eDate, status, slDate, parentId) {

    var numOfDates = getBusinessDatesCount(sDate, eDate, slDate);
    const today = new Date();
    var sTime = "09:00";
    var perDayMin = 480;
    var time = today.getHours() + ":" + today.getMinutes();
    var prev_date = new Date();
    var diffStartToCurrentDays2 = getBusinessDatesCounts(sDate, prev_date, slDate);
    var SD = new Date(sDate);
    var datenew = new Date();
    var totalDays = numOfDates;
    var currentDays = diffStartToCurrentDays2;
    //var previousDays = (parseInt(totalDays) - parseInt(currentDays)) * perDayMin;
    var toDays = (parseTime(time) - parseTime(sTime));
    var previousDayMins = (diffStartToCurrentDays2 - 1) * 480;   
    if (parseInt(toDays) >= 480)
        toDays = 480;
    else if (parseInt(toDays) < 0)
        toDays = 0;
    //var FinalDays = ((parseInt(previousDays) + parseInt(toDays)) / (totalDays * perDayMin))*100;
    var FinalDays = ((parseInt(previousDayMins) + parseInt(toDays)) / (totalDays * perDayMin)) * 100;
    // FinalDays = parseInt(FinalDays) * 100;
    var percentageTimeLeft = (FinalDays).toFixed(0);
    if (percentageTimeLeft >= 100)
        percentageTimeLeft = 100;
    if (status == "Completed" && parseInt(percentageTimeLeft) >= 100 && SD < datenew) {
        var colorObj = {
            color: "Green",
            percentage: percentageTimeLeft
        }
        return colorObj;
    }
    else {
        if (parseInt(percentageTimeLeft) < 0)
            percentageTimeLeft = percentageTimeLeft * -1;
        var colors = healthColorDependecies(percentageTimeLeft, status);
        var colorObj = {
            color: colors,
            percentage: ""
        }
        if (SD < datenew)
            colorObj.percentage = percentageTimeLeft;
        return colorObj;
        

    }
}
function predecChange(arr, lastDay, selectedInput, EndDay, Flag) {
    curntEndate = "";
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {

        if (arrayGantt[selectedIndex].subTask.length > 0) {
            multipleProdecssor(arrayGantt[selectedIndex].subTask, arr.rowCount, lastDay, selectedInput, EndDay, Flag);
        }
    }
}
function multipleProdecssor(arr, rowCount, LastDay, selectedInput, EndDay, Flag) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rowCount == rowCount) {
                if (Flag) {
                    SDdate = arr[i].shortStartDate;
                    EDdate = arr[i].shortEndDate;
                } else {
                    SDdate = arr[i].startDate;
                    EDdate = arr[i].endDate;
                }
                break;
            }
            multipleProdecssor(arr[i].subTask, rowCount, LastDay, selectedInput, EndDay, Flag);
        }
        for (var j = 0; j < arr.length; j++) {
            var stringType = "";
            var PCount = arr[j].predecessors;
            if (PCount != "") {
                PCount = PCount.split('+');

                var split = PCount[0].substr(-2);
                if (rowCount == arr[j].rowCount) {
                    if (cdcount == "") {
                        if (split == "FS" || split > 0 || split == "SS") {
                            if (selectedInput == 1) {
                                var text = "Manually changing 'Actual start' date in the result will be removal of all predecssor realtion ships on this row.Do you wish to continue?";
                                if (confirm(text)) {
                                    arr[j].predecessors = "";
                                }
                                else {
                                    if (Flag)
                                        arr[j].shortStartDate = LastDay;
                                    else
                                        arr[j].startDate = LastDay;

                                    lastDay = "";
                                }
                            }
                        } else if (split == "FF") {

                            alert("Manually changing 'Actual start' and 'Actual end 'date in the result will be removal of all predecssor realtion ships on this row");

                        } else if (split == "SF") {
                            alert("Manually changing 'Actual start' and 'Actual end 'date in the result will be removal of all predecssor realtion ships on this row");
                        }
                        cdcount = "true";
                    }
                    else {
                        cdcount = "";
                    }
                }
                else {

                    var split = PCount[0].substr(-2);
                    updatePredcData(arr[j].rowCount, split, Flag);

                }
            }
            multipleProdecssor(arr[j].subTask, rowCount, LastDay, selectedInput, EndDay, Flag);
        }
    }
    return arr;
}
function updatePredcData(rowCount, stringType, Flag) {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            subupdateData(arrayGantt[selectedIndex].subTask, rowCount, stringType, Flag);

        }

    }
}
function subupdateData(arr, rowCount, stringType, Flag) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rowCount == rowCount) {
                var d = stringType;
                var D = d.split(',');
                if (stringType == "FS" || parseInt(stringType) > 0 || parseInt(D[1]) > 0) {
                    if (EDdate != "") {
                        var GetDate = oneDayadd(EDdate, arr[i].workingDays, 1, stringType);

                        var EndDate = "";
                        if (Flag) {
                            EndDate = averageCal(arr[i].shortStartDate, arr[i].duration, arr[i].workingDays, stringType);
                            arr[i].shortEndDate = EndDate;
                            arr[i].shortStartDate = GetDate;
                        } else {
                            EndDate = averageCal(arr[i].startDate, arr[i].duration, arr[i].workingDays, stringType);
                            arr[i].endDate = EndDate;
                            arr[i].startDate = GetDate;
                        }


                        //----Ganttchart prdecssors baseline data bind
                        var d1 = "";
                        var d2 = "";
                        var s1 = "";
                        var s2 = "";
                        if (Flag) {
                            d1 = new Date(toDate(arr[i].shortStartDate));
                            d2 = new Date(toDate(arr[i].shortEndDate));
                            s1 = new Date(toDate(arr[i].startDate));
                            s2 = new Date(toDate(arr[i].endDate));
                        } else {
                            d1 = new Date(toDate(arr[i].startDate));
                            d2 = new Date(toDate(arr[i].endDate));
                            s1 = new Date(toDate(arr[i].shortStartDate));
                            s2 = new Date(toDate(arr[i].shortEndDate));
                        }
                        arr[i].values = [];
                        var obj = {
                            from: "/Date(" + d1.getTime() + ")/",
                            to: "/Date(" + d2.getTime() + ")/",
                            pfrom: "/Date(" + s1.getTime() + ")/",
                            pto: "/Date(" + s2.getTime() + ")/",
                            label: arr[i].desc,
                            desc: "Task: " + arr[i].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                            customClass: "#778461",
                            dataObj: Flag,
                            Predeccsors: arr[i].predecessors,
                        }
                        arr[i].values.push(obj);
                        break;
                    }
                }
                else if (stringType == "FF") {
                    if (EDdate != "") {
                        var GetDate = averageCal(EDdate, arr[i].duration, arr[i].workingDays, stringType);
                        var d1 = "";
                        var d2 = "";
                        var s1 = "";
                        var s2 = "";
                        if (Flag) {
                            arr[i].shortStartDate = GetDate;
                            arr[i].shortEndDate = EDdate;

                            d1 = new Date(toDate(arr[i].shortStartDate));
                            d2 = new Date(toDate(arr[i].shortEndDate));
                            s1 = new Date(toDate(arr[i].startDate));
                            s2 = new Date(toDate(arr[i].endDate));
                        } else {
                            arr[i].startDate = GetDate;
                            arr[i].endDate = EDdate;

                            d1 = new Date(toDate(arr[i].startDate));
                            d2 = new Date(toDate(arr[i].endDate));
                            s1 = new Date(toDate(arr[i].shortStartDate));
                            s2 = new Date(toDate(arr[i].shortEndDate));
                        }

                        arr[i].values = [];
                        var obj = {
                            from: "/Date(" + d1.getTime() + ")/",
                            to: "/Date(" + d2.getTime() + ")/",
                            pfrom: "/Date(" + s1.getTime() + ")/",
                            pto: "/Date(" + s2.getTime() + ")/",
                            label: arr[i].desc,
                            desc: "Task: " + arr[i].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                            customClass: "#778461",
                            dataObj: Flag,
                            Predeccsors: arr[i].predecessors,
                        }
                        arr[i].values.push(obj);
                        break;
                    }

                }
                else if (stringType == "SS") {
                    if (SDdate != "") {
                        var d1 = "";
                        var d2 = "";
                        var s1 = "";
                        var s2 = "";
                        var GetDate = averageCal(arr[i].startDate, arr[i].duration, arr[i].workingDays, stringType);
                        if (Flag) {
                            arr[i].shortEndDate = GetDate;
                            arr[i].shortStartDate = SDdate;
                            d1 = new Date(toDate(arr[i].shortStartDate));
                            d2 = new Date(toDate(arr[i].shortEndDate));
                            s1 = new Date(toDate(arr[i].startDate));
                            s2 = new Date(toDate(arr[i].endDate));
                        } else {
                            arr[i].endDate = GetDate;
                            arr[i].startDate = SDdate;
                            d1 = new Date(toDate(arr[i].startDate));
                            d2 = new Date(toDate(arr[i].endDate));
                            s1 = new Date(toDate(arr[i].shortStartDate));
                            s2 = new Date(toDate(arr[i].shortEndDate));
                        }
                        arr[i].values = [];
                        var obj = {
                            from: "/Date(" + d1.getTime() + ")/",
                            to: "/Date(" + d2.getTime() + ")/",
                            pfrom: "/Date(" + s1.getTime() + ")/",
                            pto: "/Date(" + s2.getTime() + ")/",
                            label: arr[i].desc,
                            desc: "Task: " + arr[i].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                            customClass: "#778461",
                            dataObj: Flag,
                            Predeccsors: arr[i].predecessors,
                        }
                        arr[i].values.push(obj);
                        break;
                    }
                }
                else if (stringType == "SF") {
                    if (SDdate != "") {
                        var GetDate = averageCal(SDdate, arr[i].duration, arr[i].workingDays, stringType);
                        var d1 = "";
                        var d2 = "";
                        var s1 = "";
                        var s2 = "";
                        if (Flag) {
                            arr[i].shortStartDate = GetDate;
                            arr[i].shortEndDate = SDdate;
                            d1 = new Date(toDate(arr[i].shortStartDate));
                            d2 = new Date(toDate(arr[i].shortEndDate));
                            s1 = new Date(toDate(arr[i].startDate));
                            s2 = new Date(toDate(arr[i].endDate));
                        } else {
                            arr[i].startDate = GetDate;
                            arr[i].endDate = SDdate;
                            d1 = new Date(toDate(arr[i].startDate));
                            d2 = new Date(toDate(arr[i].endDate));
                            s1 = new Date(toDate(arr[i].shortStartDate));
                            s2 = new Date(toDate(arr[i].shortEndDate));
                        }


                        arr[i].values = [];
                        var obj = {
                            from: "/Date(" + d1.getTime() + ")/",
                            to: "/Date(" + d2.getTime() + ")/",
                            pfrom: "/Date(" + s1.getTime() + ")/",
                            pto: "/Date(" + s2.getTime() + ")/",
                            label: arr[i].desc,
                            desc: "Task: " + arr[i].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                            customClass: "#778461",
                            dataObj: Flag,
                            Predeccsors: arr[i].predecessors,
                        }
                        arr[i].values.push(obj);
                        break;
                    }
                }
            }
            subupdateData(arr[i].subTask, rowCount, stringType, Flag);
        }
    }
    return arr;
}
function oneDayadd(startdate, sDay, noOfDaysToAdd, predicType) {
    var endDate = new Date(splitSlash(startdate)); var count = 0;

    while (count < noOfDaysToAdd) {

        if (sDay == "5") {
            if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                count++;
            }
        } else if (sDay == "6") {
            if (endDate.getDay() != 0) {
                count++;
            }
        } else {
            count++;
        }
        var d = predicType.split(',');
        if (predicType == "FS" || parseInt(predicType) > 0 || d[1] > 0) {
            endDate.setDate(endDate.getDate() + 1);
        } else if (predicType == "FF") {
            endDate.setDate(endDate.getDate() - 1);
        }

    }
    var changeDate = formatDate(endDate);
    return changeDate;
}
function averageCal(startDate, duration, sDay, predicType) {
    var endDate = "", noOfDaysToAdd = parseInt(duration), count = 0;
    endDate = new Date(splitSlash(startDate));
    while (count < noOfDaysToAdd) {

        if (sDay == "5") {
            if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                count++;
            }
        } else if (sDay == "6") {
            if (endDate.getDay() != 0) {
                count++;
            }
        } else {
            count++;
        }
        var d = predicType.split(',');

        if (predicType == "FS" || parseInt(predicType) > 0 || predicType == "SS" || d[1] > 0) {
            endDate.setDate(endDate.getDate() + 1);
        }
        else if (predicType == "FF" || predicType == "SF") {
            endDate.setDate(endDate.getDate() - 1);
        }

    }
    if (predicType == "FF" || predicType == "SF") { endDate.setDate(endDate.getDate() + 1); }
    else {
        endDate.setDate(endDate.getDate() - 1);
    }
    var changeDate = formatDate(endDate);
    return changeDate;
}
// Overall Earlier Date and ShortDate calculation *********************START******************
function shortEarlyDate(parentId, Flag) {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            var data = subshortEarlyDate(arrayGantt[selectedIndex].subTask, parentId, Flag);
        }
        if (arrayGantt[selectedIndex].rowCount == 1) {
            var arrayData = pLday(arrayGantt[selectedIndex].id, Flag);
            if (Flag) {
                if (Pshort != 0 && Pmax != 0) {
                    arrayGantt[selectedIndex].shortStartDate = Pshort;
                    arrayGantt[selectedIndex].shortEndDate = Pmax;
                    arrayGantt[selectedIndex].upDate = 1;
                    var d1 = new Date(toDate(arrayGantt[selectedIndex].shortStartDate));
                    var d2 = new Date(toDate(arrayGantt[selectedIndex].shortEndDate));
                    var s1 = new Date(toDate(arrayGantt[selectedIndex].startDate));
                    var s2 = new Date(toDate(arrayGantt[selectedIndex].endDate));
                    arrayGantt[selectedIndex].values = [];
                    var obj = {
                        from: "/Date(" + d1.getTime() + ")/",
                        to: "/Date(" + d2.getTime() + ")/",
                        pfrom: "/Date(" + s1.getTime() + ")/",
                        pto: "/Date(" + s2.getTime() + ")/",
                        label: arrayGantt[selectedIndex].desc,
                        desc: "Task: " + arrayGantt[selectedIndex].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                        customClass: "#778461",
                        dataObj: Flag,
                        Predeccsors: "",
                    }
                    arrayGantt[selectedIndex].values.push(obj);
                }
            } else {
                if (Pshort != 0 && Pmax != 0) {
                    arrayGantt[selectedIndex].startDate = Pshort;
                    arrayGantt[selectedIndex].endDate = Pmax;
                    arrayGantt[selectedIndex].upDate = 1;
                    var d1 = new Date(toDate(arrayGantt[selectedIndex].startDate));
                    var d2 = new Date(toDate(arrayGantt[selectedIndex].endDate));
                    var s1 = new Date(toDate(arrayGantt[selectedIndex].shortStartDate));
                    var s2 = new Date(toDate(arrayGantt[selectedIndex].shortEndDate));
                    arrayGantt[selectedIndex].values = [];
                    var obj = {
                        from: "/Date(" + d1.getTime() + ")/",
                        to: "/Date(" + d2.getTime() + ")/",
                        pfrom: "/Date(" + s1.getTime() + ")/",
                        pto: "/Date(" + s2.getTime() + ")/",
                        label: arrayGantt[selectedIndex].desc,
                        desc: "Task: " + arrayGantt[selectedIndex].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                        customClass: "#778461",
                        dataObj: Flag,
                        Predeccsors: "",
                    }
                    arrayGantt[selectedIndex].values.push(obj);
                }
            }
        }
    }
}
function pLday(parentId, Flag) {
    for (var a = 0; a < arrayGantt.length; a++)

        if (arrayGantt[a].subTask.length > 0) {
            var data = subLday(arrayGantt[a].subTask, parentId, Flag);
        }
}
function subLday(arr, parentId, Flag) {
    var maxDate = [];
    var short = [];
    var MaxDates = "";
    var LowDate = "";
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == parentId) {
                if (Flag) {
                    if (arr[i].shortStartDate != null && arr[i].shortStartDate != '' && arr[i].shortStartDate != undefined) {
                        short.push(toDate(arr[i].shortStartDate));
                    }
                    if (arr[i].shortEndDate != null && arr[i].shortEndDate != '' && arr[i].shortEndDate != undefined) {
                        maxDate.push(toDate(arr[i].shortEndDate));
                    }
                }
                else {
                    if (arr[i].startDate != null && arr[i].startDate != '' && arr[i].startDate != undefined) {
                        short.push(toDate(arr[i].startDate));
                    }
                    if (arr[i].endDate != null && arr[i].endDate != '' && arr[i].endDate != undefined) {
                        maxDate.push(toDate(arr[i].endDate));
                    }
                }
            }
            arr[i].subTask = subLday(arr[i].subTask, parentId, Flag);
        }
        if (short.length > 0) {
            var shortd = new Date(Math.min.apply(null, short));
            Pshort = trimDate(shortd);

        }
        if (maxDate.length > 0) {
            var maxd = new Date(Math.max.apply(null, maxDate));
            Pmax = trimDate(maxd);

        }
    }
    return arr;
}
function subshortEarlyDate(arr, parentId, Flag) {
    var maxDate = [];
    var short = [];
    var MaxDates = "";
    var LowDate = "";
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (Flag) {
                if (arr[i].parentId == parentId) {
                    if (arr[i].shortStartDate != null && arr[i].shortStartDate != '' && arr[i].shortStartDate != undefined) {
                        short.push(toDate(arr[i].shortStartDate));
                    }
                    if (arr[i].shortEndDate != null && arr[i].shortEndDate != '' && arr[i].shortEndDate != undefined) {
                        maxDate.push(toDate(arr[i].shortEndDate));
                    }
                }
            }
            else {
                if (arr[i].parentId == parentId) {
                    if (arr[i].startDate != null && arr[i].startDate != '' && arr[i].startDate != undefined) {
                        short.push(toDate(arr[i].startDate));
                    }
                    if (arr[i].endDate != null && arr[i].endDate != '' && arr[i].endDate != undefined) {
                        maxDate.push(toDate(arr[i].endDate));
                    }
                }
            }
            arr[i].subTask = subshortEarlyDate(arr[i].subTask, parentId, Flag);
        }
        if (short.length > 0) {
            var shortd = new Date(Math.min.apply(null, short));
            LowDate = trimDate(shortd);
            lowDateBind = trimDate(shortd);
        }
        if (maxDate.length > 0) {
            var maxd = new Date(Math.max.apply(null, maxDate));
            MaxDates = trimDate(maxd);
            MaxDateBind = trimDate(maxd);
        }
        for (var j = 0; j < arr.length; j++) {
            if (parentId == arr[j].id) {
                if (Flag) {
                    arr[j].shortStartDate = lowDateBind;
                    arr[j].shortEndDate = MaxDateBind;
                    arr[j].upDate = 1;
                    var d1 = new Date(toDate(arr[j].shortStartDate));
                    var d2 = new Date(toDate(arr[j].shortEndDate));
                    var s1 = new Date(toDate(arr[j].startDate));
                    var s2 = new Date(toDate(arr[j].endDate));
                    arr[j].values = [];
                    var obj = {
                        from: "/Date(" + d1.getTime() + ")/",
                        to: "/Date(" + d2.getTime() + ")/",
                        pfrom: "/Date(" + s1.getTime() + ")/",
                        pto: "/Date(" + s2.getTime() + ")/",
                        label: arr[j].desc,
                        desc: "Task: " + arr[j].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                        customClass: "#778461",
                        dataObj: Flag,
                        Predeccsors: "",
                    }
                    arr[j].values.push(obj);
                    break;
                } else {
                    arr[j].startDate = lowDateBind;
                    arr[j].endDate = MaxDateBind;
                    arr[j].upDate = 1;
                    var d1 = new Date(toDate(arr[j].startDate));
                    var d2 = new Date(toDate(arr[j].endDate));
                    var s1 = new Date(toDate(arr[j].shortStartDate));
                    var s2 = new Date(toDate(arr[j].shortEndDate));
                    arr[j].values = [];
                    var obj = {
                        from: "/Date(" + d1.getTime() + ")/",
                        to: "/Date(" + d2.getTime() + ")/",
                        pfrom: "/Date(" + s1.getTime() + ")/",
                        pto: "/Date(" + s2.getTime() + ")/",
                        label: arr[j].desc,
                        desc: "Task: " + arr[j].desc + "Date: " + trimDate(d1) + " to " + trimDate(d2),
                        customClass: "#778461",
                        dataObj: Flag,
                        Predeccsors: "",
                    }
                    arr[j].values.push(obj);
                    break;
                }
            }
        }
    }
    return arr;
}
// Choose the dropdown value based health color change
function taskStausOnchange(rowNo, id, comment) {
    var sTaskStatus = $("#taskStatus" + rowNo + " option:selected").val();
    var TaskManager = $("#taskmanaager" + rowNo + " option:selected").val();
    var delayReson = $("#delayreson" + rowNo + " option:selected").val();
    var remarks = $("#remarks" + rowNo).val();
    var latestcomments = $("#latestcomments" + rowNo).val();
    var delayComment = $("#delayComment" + rowNo).val();
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        for (var i = 0; i < arrayGantt[selectedIndex].subTask.length; i++) {
            arrayGantt[selectedIndex].subTask[i] = subtaskOnchange(arrayGantt[selectedIndex].subTask[i], sTaskStatus, rowNo, id, delayReson, TaskManager, delayComment, comment, remarks, latestcomments);
        }
    }
    LoadChart();
}
//SUBLOOP FOR taskStausOnchange 
function subtaskOnchange(arr, sTaskStatus, rowNo, id, delayReson, TaskManager, delayComment, comment, remarks, latestcomments) {
    if (arr.subTask.length > 0) {
        for (var i = 0; i < arr.subTask.length; i++) {
            arr.subTask[i] = subtaskOnchange(arr.subTask[i], sTaskStatus, rowNo, id, delayReson, TaskManager, delayComment, comment, remarks, latestcomments);
        }
    }
    else {
        if (rowNo == arr.rowCount) {
            arr.upDate = 1;
            switch (comment) {
                case 6:
                    sessionStorage.setItem("RowCount", "#remarks" + rowNo);
                    break;
                case 5:
                    sessionStorage.setItem("RowCount", "#latestcomments" + rowNo);
                    break;
                case 4:
                    sessionStorage.setItem("RowCount", "#delayComment" + rowNo);
                    break;
                case 3:
                    sessionStorage.setItem("RowCount", "#delayreson" + rowNo);
                    break;
                case 2:
                    sessionStorage.setItem("RowCount", "#taskStatus" + rowNo);
                    break;
                default:
                    sessionStorage.setItem("RowCount", "#taskmanaager" + rowNo);
                    break;

            }
            var TaskManagers = TaskManager.substr(TaskManager.length - 1);
            if (TaskManagers == "-")
                TaskManager = "";
            arr.taskManager = TaskManager;
            arr.delayReason = delayReson;
            arr.delayComments = delayComment;
            arr.latestcomments = latestcomments;
            arr.remarks = remarks;
            var colors = "red";
            if (parseInt(arr.percentComplete) < 60 && parseInt(arr.percentComplete) != 100 && parseInt(arr.percentComplete) != 0) {
                colors = "green";
            } else if (parseInt(arr.percentComplete) >= 60 && parseInt(arr.percentComplete) != 100) {
                colors = "yellow";
            } else if (parseInt(arr.percentComplete) == 100)
                colors = "red";

            if (sTaskStatus == "Completed" && parseInt(arr.percentComplete) >= 100) {
                arr.health = "green";
                arr.taskStatus = "Completed";

            }
            else if (sTaskStatus == "In Progress") {
                arr.health = colors;
                arr.taskStatus = "In Progress";
            }
            else if (sTaskStatus == "Not Started") {
                arr.health = colors;
                arr.taskStatus = "Not Started";
            }
            else if (sTaskStatus == "On Hold") {
                arr.health = colors;
                arr.taskStatus = "On HOLD";
            }
            else {
                arr.health = colors;
                arr.taskStatus = sTaskStatus;
            }
        }
    }
    return arr;
}
//***************************END****************************
//BASELINE CHART SUBMIT AND RESET FUNCTION *******START*********
function baseResetOn() {
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        arrayGantt[selectedIndex].baseline = false;
        if (arrayGantt[selectedIndex].shortStartDate != "" && arrayGantt[selectedIndex].shortEndDate != "") {
            arrayGantt[selectedIndex].variance = 0;
            arrayGantt[selectedIndex].upDate = 1;
            arrayGantt[selectedIndex].startDate = arrayGantt[selectedIndex].shortStartDate;
            arrayGantt[selectedIndex].endDate = arrayGantt[selectedIndex].shortEndDate;
            arrayGantt[selectedIndex].predecessors = "";
        }
        else {
            arrayGantt[selectedIndex].variance = "";
        }
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            for (var i = 0; i < arrayGantt[selectedIndex].subTask.length; i++) {
                arrayGantt[selectedIndex].subTask[i].baseline = false;
                if (arrayGantt[selectedIndex].subTask[i].shortStartDate != "" && arrayGantt[selectedIndex].subTask[i].shortEndDate != "") {
                    arrayGantt[selectedIndex].subTask[i].startDate = arrayGantt[selectedIndex].subTask[i].shortStartDate;
                    arrayGantt[selectedIndex].subTask[i].endDate = arrayGantt[selectedIndex].subTask[i].shortEndDate;
                    arrayGantt[selectedIndex].subTask[i].upDate = 1;
                }
                //arrayGantt[selectedIndex].subTask[i].predecessors = "";
                arrayGantt[selectedIndex].subTask[i].duration = sumDuration(arrayGantt[selectedIndex].subTask[i].startDate, arrayGantt[selectedIndex].subTask[i].endDate, arrayGantt[selectedIndex].subTask[i].rowCount);
                if (arrayGantt[selectedIndex].subTask[i].endDate != "") {
                    arrayGantt[selectedIndex].subTask[i].variance = 0;
                }
                else {
                    arrayGantt[selectedIndex].subTask[i].variance = "";
                }

                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    for (var j = 0; j < arrayGantt[selectedIndex].subTask[i].subTask.length; j++) {
                        arrayGantt[selectedIndex].subTask[i].subTask[j].baseline = false;
                        if (arrayGantt[selectedIndex].subTask[i].subTask[j].shortStartDate != 'undefined') {
                            var _psdate = arrayGantt[selectedIndex].subTask[i].subTask[j].shortStartDate;
                            var _pedate = arrayGantt[selectedIndex].subTask[i].subTask[j].shortEndDate;
                            var _start = arrayGantt[selectedIndex].subTask[i].subTask[j].startDate;
                            var _end = arrayGantt[selectedIndex].subTask[i].subTask[j].endDate;
                            var workingDayas = arrayGantt[selectedIndex].subTask[i].subTask[j].workingDays;
                            var parentId = arrayGantt[selectedIndex].subTask[i].subTask[j].parentId;
                            var health = SetHealthValue(splitSlash(_start), splitSlash(_end), "", workingDayas, parentId);
                            if (health != undefined) {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].health = health.color;
                                console.log("health percent 3: " + health.percentage);
                                arrayGantt[selectedIndex].subTask[i].subTask[j].percentComplete = health.percentage;
                            }

                            if (_psdate != "" && _pedate != "") {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].startDate = _psdate;
                                arrayGantt[selectedIndex].subTask[i].subTask[j].endDate = _pedate;
                                arrayGantt[selectedIndex].subTask[i].subTask[j].upDate = 1;
                            }
                            //  arrayGantt[selectedIndex].subTask[i].subTask[j].predecessors = "";
                            if (_pedate != "" && _end != "") {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].variance = 0;
                            } else {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].variance = "";
                            }

                            arrayGantt[selectedIndex].subTask[i].subTask[j].duration = sumDuration(arrayGantt[selectedIndex].subTask[i].subTask[j].startDate, arrayGantt[selectedIndex].subTask[i].subTask[j].endDate, arrayGantt[selectedIndex].subTask[i].subTask[j].rowCount);

                            if (arrayGantt[selectedIndex].subTask[i].subTask[j].subTask.length > 0) {

                                for (var k = 0; k < arrayGantt[selectedIndex].subTask[i].subTask[j].subTask.length; k++) {
                                    arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].baseline = false;
                                    var _psdates = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].shortStartDate;
                                    var _pedates = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].shortEndDate;
                                    var WDay = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].workingDays;
                                    var PId = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].parentId;
                                    var healthSolutions = SetHealthValue(splitSlash(_psdates), splitSlash(_pedates), "", WDay, PId);
                                    if (healthSolutions != undefined) {
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].health = healthSolutions.color;
                                        if (healthSolutions.percentage != "") {
                                            console.log("health percent 4: " + healthSolutions.percentage);
                                            arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].percentComplete = healthSolutions.percentage + '%';
                                        } else {
                                            console.log("health percent 5: " + healthSolutions.percentage);
                                            arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].percentComplete = healthSolutions.percentage;
                                        }
                                    }
                                    if (_psdates != "" && _pedates != "") {
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].startDate = _psdates;
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].endDate = _pedates;

                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].upDate = 1;
                                    }

                                    //  arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].predecessors = "";
                                    if (_pedates != "" && arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].endDate != "")
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].variance = 0;
                                    else
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].variance = "";
                                }
                            }
                            if (arrayGantt[selectedIndex].subTask[i].subTask[j].parentId != "") {
                                var duration = NewCheckDuration(arrayGantt[selectedIndex].subTask[i].id);
                                if (duration == "0" || duration == 0) {
                                    duration = "";
                                }
                                arrayGantt[selectedIndex].subTask[i].duration = duration + 'd';
                                arrayGantt[selectedIndex].subTask[i].variance = "";
                                arrayGantt[selectedIndex].subTask[i].upDate = 1;
                                // arrayGantt[selectedIndex].subTask[i].predecessors = "";
                            }
                        }
                    }
                }
                else {
                    arrayGantt[selectedIndex].subTask[i].baseline = false;
                    if (arrayGantt[selectedIndex].subTask[i].shortStartDate != "" && arrayGantt[selectedIndex].subTask[i].shortEndDate != "") {
                        arrayGantt[selectedIndex].subTask[i].startDate = arrayGantt[selectedIndex].subTask[i].shortStartDate;
                        arrayGantt[selectedIndex].subTask[i].endDate = arrayGantt[selectedIndex].subTask[i].shortEndDate;
                        arrayGantt[selectedIndex].subTask[i].duration = sumDuration(arrayGantt[selectedIndex].subTask[i].startDate, arrayGantt[selectedIndex].subTask[i].endDate, arrayGantt[selectedIndex].subTask[i].rowCount);
                        arrayGantt[selectedIndex].subTask[i].variance = "";
                        arrayGantt[selectedIndex].subTask[i].upDate = 1;
                    }
                    //arrayGantt[selectedIndex].subTask[i].predecessors = "";
                }
            }
        }
        else {
            arrayGantt[selectedIndex].baseline = false;
            arrayGantt[selectedIndex].startDate = arrayGantt[selectedIndex].shortStartDate;

        }
    }
    $('#baseLine').modal('hide');
    Updatedata();

}
function baseOn() {

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        arrayGantt[selectedIndex].baseline = true;
        if (arrayGantt[selectedIndex].startDate != "" && arrayGantt[selectedIndex].shortEndDate != "") {
            arrayGantt[selectedIndex].variance = 0;
            arrayGantt[selectedIndex].upDate = 1;

            arrayGantt[selectedIndex].shortStartDate = arrayGantt[selectedIndex].startDate;
            arrayGantt[selectedIndex].shortEndDate = arrayGantt[selectedIndex].endDate;
        } else {
            arrayGantt[selectedIndex].variance = "";

        }
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            for (var i = 0; i < arrayGantt[selectedIndex].subTask.length; i++) {
                arrayGantt[selectedIndex].subTask[i].baseline = true;
                if (arrayGantt[selectedIndex].subTask[i].startDate != null && arrayGantt[selectedIndex].subTask[i].endDate != '' && arrayGantt[selectedIndex].subTask[i].endDate != undefined) {
                    arrayGantt[selectedIndex].subTask[i].shortStartDate = arrayGantt[selectedIndex].subTask[i].startDate;
                    arrayGantt[selectedIndex].subTask[i].shortEndDate = arrayGantt[selectedIndex].subTask[i].endDate;
                }
                arrayGantt[selectedIndex].subTask[i].duration = sumDuration(arrayGantt[selectedIndex].subTask[i].shortStartDate, arrayGantt[selectedIndex].subTask[i].shortEndDate, arrayGantt[selectedIndex].subTask[i].rowCount);

                if (arrayGantt[selectedIndex].subTask[i].startDate != "") {
                    arrayGantt[selectedIndex].subTask[i].variance = 0;
                    arrayGantt[selectedIndex].subTask[i].upDate = 1;
                }
                else {
                    arrayGantt[selectedIndex].subTask[i].variance = "";

                }
                if (arrayGantt[selectedIndex].subTask.length > 0) {
                    for (var j = 0; j < arrayGantt[selectedIndex].subTask[i].subTask.length; j++) {
                        arrayGantt[selectedIndex].subTask[i].subTask[j].baseline = true;
                        if (arrayGantt[selectedIndex].subTask[i].subTask[j].shortStartDate != 'undefined') {
                            var _psdate = arrayGantt[selectedIndex].subTask[i].subTask[j].startDate;
                            var _pedate = arrayGantt[selectedIndex].subTask[i].subTask[j].endDate;
                            var workingDayas = arrayGantt[selectedIndex].subTask[i].subTask[j].workingDays;
                            var parentId = arrayGantt[selectedIndex].subTask[i].subTask[j].parentId;

                            if (_psdate != "" && _pedate != "") {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].shortStartDate = _psdate;
                                arrayGantt[selectedIndex].subTask[i].subTask[j].shortEndDate = _pedate;
                                arrayGantt[selectedIndex].subTask[i].subTask[j].upDate = 1;
                            }

                            if (_pedate != "") {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].variance = 0;
                            } else {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].variance = "";
                            }
                            var health = SetHealthValue(splitSlash(_psdate), splitSlash(_pedate), "", workingDayas, parentId);
                            if (health != undefined) {
                                arrayGantt[selectedIndex].subTask[i].subTask[j].health = health.color;
                                if (health.percentage != "") {
                                    console.log("health percent 6: " + health.percentage);
                                    arrayGantt[selectedIndex].subTask[i].subTask[j].percentComplete = health.percentage + '%';
                                } else {
                                    console.log("health percent 7: " + health.percentage);
                                    arrayGantt[selectedIndex].subTask[i].subTask[j].percentComplete = health.percentage;
                                }
                            }
                            arrayGantt[selectedIndex].subTask[i].subTask[j].duration = sumDuration(arrayGantt[selectedIndex].subTask[i].subTask[j].shortStartDate, arrayGantt[selectedIndex].subTask[i].subTask[j].shortEndDate, arrayGantt[selectedIndex].subTask[i].subTask[j].rowCount);
                            if (arrayGantt[selectedIndex].subTask[i].subTask[j].subTask.length > 0) {
                                for (var k = 0; k < arrayGantt[selectedIndex].subTask[i].subTask[j].subTask.length; k++) {
                                    var _psdates = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].startDate;
                                    var _pedates = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].endDate;
                                    var WDay = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].workingDays;
                                    var PId = arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].parentId;
                                    var healthSolution = SetHealthValue(splitSlash(_psdates), splitSlash(_pedates), "", WDay, PId);
                                    if (healthSolution != undefined) {
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].health = healthSolution.color;
                                        if (healthSolution.percentage != "") {
                                            console.log("health percent 8: " + healthSolution.percentage);
                                            arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].percentComplete = healthSolution.percentage + '%';
                                        } else {
                                            console.log("health percent 9: " + healthSolution.percentage);
                                            arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].percentComplete = healthSolution.percentage;
                                        }
                                    }
                                    if (_psdates != "" && _pedates != "") {
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].shortStartDate = _psdates;
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].shortEndDate = _pedates;
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].upDate = 1;
                                    }

                                    arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].baseline = true;

                                    if (_pedates != "")
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].variance = 0;
                                    else
                                        arrayGantt[selectedIndex].subTask[i].subTask[j].subTask[k].variance = "";
                                }
                            }
                            if (arrayGantt[selectedIndex].subTask[i].subTask[j].parentId != "") {
                                var duration = NewCheckDuration(arrayGantt[selectedIndex].subTask[i].id);
                                if (duration == "0" || duration == 0) {
                                    duration = "";
                                }
                                arrayGantt[selectedIndex].subTask[i].duration = duration + 'd';
                                arrayGantt[selectedIndex].subTask[i].variance = "";

                            }
                        }
                    }
                }
                else {
                    arrayGantt[selectedIndex].subTask[i].baseline = true;

                    if (arrayGantt[selectedIndex].subTask[i].startDate != "" && arrayGantt[selectedIndex].subTask[i].endDate != "") {
                        arrayGantt[selectedIndex].subTask[i].shortStartDate = arrayGantt[selectedIndex].subTask[i].startDate;
                        arrayGantt[selectedIndex].subTask[i].shortEndDate = arrayGantt[selectedIndex].subTask[i].endDate;
                        arrayGantt[selectedIndex].subTask[i].duration = sumDuration(arrayGantt[selectedIndex].subTask[i].shortStartDate, arrayGantt[selectedIndex].subTask[i].shortEndDate, arrayGantt[selectedIndex].subTask[i].rowCount);
                        arrayGantt[selectedIndex].subTask[i].variance = "";
                        arrayGantt[selectedIndex].subTask[i].upDate = 1;
                    }

                }
            }
        }
        else {
            arrayGantt[selectedIndex].baseline = true;

            arrayGantt[selectedIndex].shortStartDate = arrayGantt[selectedIndex].startDate;

        }
    }
    $('#baseLine').modal('hide');
    Updatedata();

}
//******END*******
function sumDuration(startDate, Endate, RowCount) {
    var sDay = $("#daySelect_" + RowCount + " option:selected").val();
    var count = 0;
    if (startDate != "" && Endate != "") {
        var SD = new Date(splitSlash(startDate));
        var ED = new Date(splitSlash(Endate));

        var diff = new Date(ED - SD);
        var days = diff / 1000 / 60 / 60 / 24;

        while (SD < ED) {
            if (sDay == "5") {

                if (SD.getDay() != 0 && SD.getDay() != 6) {
                    count++;
                }
            } else if (sDay == "6") {
                if (SD.getDay() != 0) {
                    count++;
                }
            } else {
                count++;
            }
            SD.setDate(SD.getDate() + 1);
        }
        count = (count + 1) + 'd';
    } else {
        count = "";
    }

    return count;
}
//OVER ALL DURATION ALCUALTION IN ACTUAL DATE AND PLAN  DATE CHANGE TIME ************START********
function NewCheckDuration(Id) {
    XSumBase = 0;
    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].subTask.length > 0) {
            if (arrayGantt[selectedIndex].subTask.length > 0) {
                for (var i = 0; i < arrayGantt[selectedIndex].subTask.length; i++) {
                    var data = subNewCheckDuration(arrayGantt[selectedIndex].subTask, Id);
                    break;
                }

            }
            if (arrayGantt[selectedIndex].rowCount == 1) {
                var data = MasterSum(arrayGantt[selectedIndex].id);
                if (MasterDuration > 0) {
                    arrayGantt[selectedIndex].duration = MasterDuration + 'd';
                }
            }
        }
    }
    return XSumBase;
}
function subNewCheckDuration(arr, Id) {

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == Id) {
                var D = arr[i].duration;
                /* var e = D.split('d');*/
                if (D != '') {
                    XSumBase += parseInt(D);
                }

            }
            var data = subNewCheckDuration(arr[i].subTask, Id);
        }

    }

    return arr;

}
function MasterSum(parentId) {
    MasterDuration = 0;
    for (var a = 0; a < arrayGantt.length; a++)

        if (arrayGantt[a].subTask.length > 0) {
            var data = subMasterSum(arrayGantt[a].subTask, parentId);
        }

}
function subMasterSum(arr, parentId) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].parentId == parentId) {
                var D = arr[i].duration;

                if (D != '') {
                    MasterDuration += parseInt(D);
                }
            }
            arr[i].subTask = subMasterSum(arr[i].subTask, parentId);
        }
    }
    return arr;
}
var getFormattedString = function (date) {
    const d = new Date(date);
    var check = String('0' + d.getDate()).toString().slice(-2) + "/" + ('0' + (d.getMonth() + 1)).toString().slice(-2) + "/" + d.getFullYear();
    return check;
}
//adding sub row on the sheet
function AddSubTask(indexId) {
    var subTaskObj = {
        allocation: "",
        commitedEndDate: "",
        delayComments: "",
        delayReason: "",
        desc: "",
        duration: "1d",
        endDate: trimDate(new Date()),
        health: "Yellow",
        id: 0,
        name: "",
        noofdays: 1,
        parentId: indexId,
        percentComplete: "",
        taskManager: "",
        predecessors: "",
        projectManager: "",
        projectStartDate: "",
        shortStartDate: trimDate(new Date()),
        shortEndDate: trimDate(new Date()),
        latestcomments: "",
        remarks: "",
        planBaseLine: false,
        rowNo: 0,
        scientist: "",
        siblingId: null,
        slDate: 5,
        startDate: trimDate(new Date()),
        taskStatus: "",
        variance: "",
        subTask: [],
        rowCount: 0,
        values: [
            {
                from: "/Date(" + new Date().getTime() + ")/",
                to: "/Date(" + new Date().getTime() + ")/",
                pfrom: "/Date(" + new Date().getTime() + ")/",
                pto: "/Date(" + new Date().getTime() + ")/",
                label: "New",
                desc: "New",
                customClass: "ganttGreen"
            }
        ],
        upDate: 0
    }

    for (var selectedIndex = 0; selectedIndex < arrayGantt.length; selectedIndex++) {
        if (arrayGantt[selectedIndex].id == indexId) {
            if (arrayGantt[selectedIndex].subTask.length > 0)
                subTaskObj.siblingId = arrayGantt[selectedIndex].subTask[(arrayGantt[selectedIndex].subTask.length - 1)].id;
            subTaskObj.values[0].customClass = "ganttLightBlue";
            arrayGantt[selectedIndex].subTask.push(subTaskObj);
            break;
        }
        else {
            arrayGantt[selectedIndex].subTask = CheckSubTree(arrayGantt[selectedIndex].subTask, indexId, subTaskObj);
        }
    }
    CalculateEndDate();
}
//remove the row of subtask loop condition
function CheckSubTree(arr, indexId, subTaskObj) {
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == indexId) {
                if (arr[i].subTask.length > 0)
                    subTaskObj.siblingId = arr[i].subTask[(arr[i].subTask.length - 1)].id;
                if (subTaskObj.siblingId == null) {
                    subTaskObj.siblingId = indexId;
                }
                arr[i].subTask.push(subTaskObj);
                break;
            }
            else {
                arr[i].subTask = CheckSubTree(arr[i].subTask, indexId, subTaskObj);
            }
        }
    }
    return arr;
}
//*********************END**************************

//============================================END=========================================================

