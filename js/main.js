//add closure to avoid pollution of global variables
(function(){
    var stateSum;
    var ready = 0;
    var stateFlow2012;
    alasql("CREATE TABLE stateFlow2012 (t string, s string, fo string, tr string, v number, w number, tm number)");
    alasql("CREATE TABLE stateFlow2007 (t string, s string, fo string, tr string, v number, w number, tm number)");
    alasql("CREATE TABLE stateFlow2002 (t string, s string, fo string, tr string, v number, w number, tm number)");
    alasql("CREATE TABLE stateFlow1997 (t string, s string, fo string, tr string, v number, w number, tm number)");

    /*$.getJSON('./data/2012/state_sum_all.json', function(json){
     stateSum = json;
     ready++;
     });*/
    $.getJSON('./data/2012/state_flow.json', function(json){
        alasql.tables.stateFlow2012.data = json;
        ready++;
    });
    $.getJSON('./data/2007/state_flow.json', function(json){
        alasql.tables.stateFlow2007.data = json;
        ready++;
    });
    $.getJSON('./data/2002/state_flow.json', function(json){
        alasql.tables.stateFlow2002.data = json;
        ready++;
    });
    $.getJSON('./data/1997/state_flow.json', function(json){
        alasql.tables.stateFlow1997.data = json;
        ready++;
    });

    var statesAlpha = {
        "AL": 1,
        "AK": 2,
        "AZ": 3,
        "AR": 4,
        "CA": 5,
        "CO": 6,
        "CT": 7,
        "DE": 8,
        "DC": 9,
        "FL": 10,
        "GA": 11,
        "HI": 12,
        "ID": 13,
        "IL": 14,
        "IN": 15,
        "IA": 16,
        "KS": 17,
        "KY": 18,
        "LA": 19,
        "ME": 20,
        "MD": 21,
        "MA": 22,
        "MI": 23,
        "MN": 24,
        "MS": 25,
        "MO": 26,
        "MT": 27,
        "NE": 28,
        "NV": 29,
        "NH": 30,
        "NJ": 31,
        "NM": 32,
        "NY": 33,
        "NC": 34,
        "ND": 35,
        "OH": 36,
        "OK": 37,
        "OR": 38,
        "PA": 39,
        "RI": 40,
        "SC": 41,
        "SD": 42,
        "TN": 43,
        "TX": 44,
        "UT": 45,
        "VT": 46,
        "VA": 47,
        "WA": 48,
        "WV": 49,
        "WI": 50,
        "WY": 51
    };
    var arcData, graph, states, dotsIndex;
    var stateSumNorm = { // What to divide by for states
        // [ 'forDots', 'forSelfDots', 'forArcWidth', 'forStateColor', 'forPopup']
        'w': [16000, 1500, 500, 15000, 1000],
        'v': [10000, 1000, 500, 5000, 1000],
        'tm': [4000, 300, 500, 1500, 1000]
    };
    function waitForData() {
        if (ready != 4) {
            setTimeout(waitForData, 500);
        } else {
            setUp();
        }
    }
    function drawArcs() {
        // Draw Arcs
        var arcG = graph.find('.gray-arc2');
        arcG.empty(); // Remove all children
        //for (var i = 0; i < arcData.length; i++) {
        for (var i = 0; i < arcData.length; i++) {
            if (arcData[i]['s'] == arcData[i]['t']) {
                // This is handled elsewhere
            } else {
                // Draw Arc
                var size = Math.round(arcData[i]['w']/stateSumNorm[dotsIndex][2]*10)/10;
                if (size < 1) {
                    size = 1;
                } else if (size > 20) {
                    size = 20
                }
                var state1 = states[arcData[i]['t']]*25-25+14;
                var state2 = states[arcData[i]['s']]*25-25+14;
                var xmove = 0;
                if (state1 < state2) {
                    xmove = state2-state1;
                } else {
                    xmove = state1 - state2;
                    state1 = state2;
                }
                arcG.append(
                    $(document.createElementNS("http://www.w3.org/2000/svg", "path"))
                    //.attr('id', arcData[i]['s']+'ToSelf')
                        .attr('class', 'import-line import-'+arcData[i]['t']+' export-'+arcData[i]['s'])
                        // rx ry x-axis-rotation large-arc-flag sweep-flag x y
                        .attr('d', 'M '+state1+' 380 a 1.7 1 0 0 1 '+xmove+' 0')
                        .attr('stroke-width', size)

                );
            }
        }
    }

    function queryWhere() {
        var f = $('#filterFood').val();
        var t = $('#filterTrans').val();
        var query = '';
        if (t != 'all') {
            query = 'WHERE tr IN (\''+t.split(',').join("','")+'\')'
        }
        if (f != 'all') {
            if (query != '') {
                query += ' AND ';
            } else {
                query = 'WHERE ';
            }
            query += 'fo = \''+f+'\''
        }

        return query;
    }
    var stateRankI;
    var stateRankE;
    var selectList = {};
    function computeRanks() {
        var stateRankIa = [];
        var stateRankEa = [];
        Object.keys(states).forEach(function (key) {
            stateRankIa.push([stateSum[key]['i'], key]);
            stateRankEa.push([stateSum[key]['e'], key]);
        });
        stateRankIa.sort(function (a, b) { return b[0]-a[0]; });
        stateRankEa.sort(function (a, b) { return b[0]-a[0]; });
        stateRankI = {};
        stateRankE = {};
        for (var i = 0; i < stateRankIa.length; i++) {
            stateRankI[stateRankIa[i][1]] = i+1;
        }
        for (i = 0; i < stateRankEa.length; i++) {
            stateRankE[stateRankEa[i][1]] = i+1;
        }
    }

    function sortStates() {
        // Reverse states
        var val = $('#sortSelect').val();

        if (val != 'alphabet') {
            var stateRanka = [];
            Object.keys(states).forEach(function (key) {
                stateRanka.push([stateSum[key]['i'] + stateSum[key]['e'], key]);
            });
            stateRanka.sort(function (a, b) {
                return a[0] - b[0];
            });
            var stateRank = {};
            for (var i = 0; i < stateRanka.length; i++) {
                stateRank[stateRanka[i][1]] = i+1;
            }
        }
        Object.keys(states).forEach(function(key) {
            if (val == 'alphabet') {
                states[key] = statesAlpha[key];
            } else {
                states[key] = stateRank[key];
            }
            $('#'+key+'StateBox').attr('class', 'state state'+states[key]);
            //.addClass('state'+states[key])
            //.attr('transform', 'translate('+((states[key]-1)*25+2)+',417)');
            //if (key == 'AL') {
            //    $('#'+key+'StateBox').addClass('state2').removeClass('state1');
            //}
        });
        drawArcs();
        if (selectedState) {
            selectState(selectedState);
        }
    }

    function stateSumCalc() {
        var data1 = alasql('SELECT s, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+queryWhere()+' GROUP BY s');
        var data2 = alasql('SELECT t, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+queryWhere()+' GROUP BY t');
        stateSum = {};
        Object.keys(statesAlpha).forEach(function(key) {
            stateSum[key] = {'e': 0, 'i': 0}
        });

        for (var i = 0; i < data1.length; i++) {
            if (data1[i].s) {
                stateSum[data1[i].s]['e'] = data1[i]['w']
            }
        }
        for (i = 0; i < data2.length; i++) {
            if (data2[i].t) {
                stateSum[data2[i].t]['i'] = data2[i]['w']
            }
        }
    }
    function drawDots() {
        stateSumCalc();

        var max = 0;
        Object.keys(states).forEach(function(key) {
            var j = (stateSum[key]['i']+stateSum[key]['e']) / stateSumNorm[dotsIndex][4];
            if (j > max) {
                max = j;
            }
        });
        var dot = max / 100;
        var unit;
        if (dotsIndex == 'w') {
            unit = 'pounds';
        } else if (dotsIndex == 'v') {
            unit = 'dollars';
        } else {
            unit = 'ton miles';
        }
        if (dot > 2) {
            dot = Math.ceil(dot);
            $(".dotUnit").text(dot.toFixed(0)+' bn '+unit+'/dot');
        } else {
            dot = Math.ceil(dot * 100) / 100;
            if (dot < 0.01) {
                dot = 0.01;
            }
            $(".dotUnit").text(dot.toFixed(2)+' bn '+ unit +'/dot');
        }


        Object.keys(states).forEach(function(key) {
            var size = Math.round(Math.sqrt(
                        (stateSum[key]['i'] + stateSum[key]['e'])/stateSumNorm[dotsIndex][1]
                    ) * 6)/10;
            if (size < 3) {
                size = 3;
            }
            if (size > 10) {
                size = 10;
            }
            var selfCircle = $('#'+key+'ToSelf');
            if (selfCircle.length) {
                selfCircle.attr('r', size);
            } else {
                $('#' + key + 'StateBox').append(
                    // Add the White Circle
                    $(document.createElementNS("http://www.w3.org/2000/svg", "circle"))
                        .attr('cx', 12)
                        .attr('cy', 8).attr('r', 10).addClass('stateCircleWhite')
                ).append(
                    // Add the Big Circle
                    $(document.createElementNS("http://www.w3.org/2000/svg", "circle")).attr('id', key + 'ToSelf')
                        .attr('cx', 12).data('state', key)
                        .attr('cy', 8).attr('r', size).addClass('stateCircle')
                );
            }

            var box = $('#'+key+'DotsBox');

            if (box.length) {
                box.empty();
            } else {
                $('#' + key + 'StateBox').append(
                    $(document.createElementNS("http://www.w3.org/2000/svg", "g")).attr('id', key + 'DotsBox')
                        .addClass('dots').attr('transform', 'translate(0,61)')
                );
                box = $('#'+key+'DotsBox');
            }
            var importDots = Math.round(stateSum[key]['i']/stateSumNorm[dotsIndex][4]/dot);
            if (importDots < 0) {
                importDots = 0;
            }
            var exportDots = Math.round(stateSum[key]['e']/stateSumNorm[dotsIndex][4]/dot);
            //if (importDots + exportDots > 50) {
            //    exportDots = 60 - importDots;
            //}
            if (importDots > 70) {
                console.log('import dots restricted', importDots, key);
                importDots = 70;
            }
            if (exportDots > 70) {
                console.log('export dots restricted', exportDots, key);
                exportDots = 70;
            }
            for (var i = 0; i < importDots; i++) {
                addDot(box, i, 0, 'import');
            }
            for (i = 0; i < exportDots; i++) {
                addDot(box, i, importDots, 'export');
            }
        });
    }

    function calculateBuckets(mapValues, split) {
        var bottom = 0, top = 0;
        for (var i = 0; i < mapValues.length; i++) {
            if (mapValues[i] == 0) {
                continue;
            }
            var x = Math.floor(mapValues[i] / split) + 1;
            if (x <= 1) {
                bottom++;
            } else if (x >= 6) {
                top++;
            }
        }
        if (bottom > top) {
            return true;
        }
    }

    function colorMap(stateSum) {
        var imEx = $('input[name=mapRadio]:checked').val();
        var val;
        var mapValues = [];
        Object.keys(states).forEach(function(key) {
            if (imEx == 'i') {
                val = stateSum[key]['i'];
            } else if (imEx == 'e') {
                val = stateSum[key]['e'];
            } else {
                val = stateSum[key]['i'] + stateSum[key]['e'];
            }
            mapValues.push(val / stateSumNorm[dotsIndex][4]);
        });
        mapValues.sort(function(a, b){return a-b});
        var j = 1;
        var max = mapValues[mapValues.length - j];
        var split = max / 6;
        while (calculateBuckets(mapValues, split)) {
            j++;
            max = mapValues[mapValues.length - j];
            if (max == 0) {
                break;
            }
            split = max / 6;
        }
        if (split > 2) {
            split = Math.round(split);
            $('#mapKey1').text((split * 2).toFixed(0));
            $('#mapKey2').text((split * 4).toFixed(0));
            $('#mapKey3').text('> ' + (split * 6).toFixed(0));
        } else {
            split = Math.round(split * 100) / 100;
            if (split < 0.01) {
                split = 0.01;
            }
            $('#mapKey1').text((split * 2).toFixed(2));
            $('#mapKey2').text((split * 4).toFixed(2));
            $('#mapKey3').text('> ' + (split * 6).toFixed(2));
        }
        Object.keys(states).forEach(function(key) {
            if (imEx == 'i') {
                val = stateSum[key]['i'];
            } else if (imEx == 'e') {
                val = stateSum[key]['e'];
            } else {
                val = stateSum[key]['i'] + stateSum[key]['e'];
            }
            var x = Math.floor((val / stateSumNorm[dotsIndex][4]) / split) + 1;
            if (x < 1) {
                x = 1;
            }
            if (x > 6) {
                x = 6;
            }
            $('#stateMap' + key + ' rect').attr('class', 'mapColor' + x);
        });
    }
    var stateAbbr = {};
    var graphYear = 2012;
    $(document).ready(waitForData);
    function setUp() {
        $( "#slider" ).slider({
            value:4,
            min: 1,
            max: 4,
            step: 1,
            slide: function( event, ui ) {
                if (ui.value == 4) {
                    graphYear = 2012;
                } else if (ui.value == 3) {
                    graphYear = 2007;
                } else if (ui.value == 2) {
                    graphYear = 2002;
                } else {
                    graphYear = 1997;
                }
                $('span.year').text(graphYear);
                redraw();
            }
        });
        $.each($('.selectbox'), function(){
            var $this = $(this);
            selectList[$this.attr('id')] = $this.selectize({
                create: true
            });
        });

        $.getJSON('./data/codeToState.json', function(json){
            var stateList = json;
            $.each(stateList, function(index, item){
                item.text = item.abbreviation + '-' + item.name;
                item.value = item.abbreviation;
                stateAbbr[item.abbreviation] = item.name;
            });

            selectList.stateSelect[0].selectize.addOption(stateList);
        });

        states = {};
        graph = $('#arcGraph');
        // Deep Copy alphabetical into the current active and setup states
        Object.keys(statesAlpha).forEach(function(key) {
            states[ key ] = statesAlpha[ key ];
            graph.append(
                $(document.createElementNS("http://www.w3.org/2000/svg", "g")).attr('id', key+'StateBox')
                    .attr('class', 'state state'+states[key])
                    //.attr('transform', 'translate('+((states[ key ]-1)*25+2)+',417)')
                    .append(
                        $(document.createElementNS("http://www.w3.org/2000/svg", "rect")).attr('class', 'stateRect')
                            .attr('x', 0).attr('y', 33).attr('width',24).attr('height', 19).data('state', key)
                    )
                    .append(
                        $(document.createElementNS("http://www.w3.org/2000/svg", "text")).attr('class', 'stateText')
                            .attr('x', 12).attr('y', 47).text(key).attr('text-anchor', 'middle').data('state', key)
                    )
            );
        });
        dotsIndex = $('#viewSelect').val();
        redraw();

        $('#filterFood, #filterTrans').change(redraw);
        $('#viewSelect').change(viewChange);
        $('#shade').click(shadeChange);
        $('#sortSelect').change(sortStates);
        $('#closeState').click(function() { unselectState(); drawBarGraph(); });
        $('#stateSelect').change(stateChange);
        $('#mapSVG').find('rect, text').click(function() {
            var state = $(this).parents('g').find('text').text();
            selectState(state);
            drawBarGraph();
        });
        $('.stateCircle, .stateText').hover(stateHoverIn, stateHoverOut).click(stateClick);
        $('input[name=mapRadio]').change(function() {
            if (selectedState) {
                selectState(selectedState);
            } else {
                colorMap(stateSum);
            }
        });


        //ellie
        startIntro();
    }
    function shadeChange() {
        var shade = $(this).data('value');
        if (shade == 'IE') {
            shade = 'Food';
            $(this).data('value', 'Food').text('(Show Import and Export)');
        } else {
            shade = 'IE';
            $(this).data('value', 'IE').text('(Show Food Categories)');
        }
        $('#keyFood, #keyIE').hide();
        $('#key'+shade).show();
        if (selectedState) {
            buildStateTable(selectedState);
        }
    }
    function viewChange() {
        dotsIndex = $('#viewSelect').val();
        var optText = $("#viewSelect option:selected").text();
        $('.viewSelectText').text(optText);
        if (dotsIndex == 'w') {
            $('.keyUnits').text('In Billions of Pounds');
            $('#mapKey1').text('30');
            $('#mapKey2').text('60');
            $('#mapKey3').text('> 90');
        } else if (dotsIndex == 'v') {
            $('.keyUnits').text('In Billions of Dollars');
            $('#mapKey1').text('10');
            $('#mapKey2').text('20');
            $('#mapKey3').text('> 30');
        } else {
            $('.keyUnits').text('In Billions of Ton Miles');
            $('#mapKey1').text('3');
            $('#mapKey2').text('6');
            $('#mapKey3').text('> 9');
        }
        redraw();
    }
    function redraw() {
        arcData = alasql('SELECT s, t, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+queryWhere()+' GROUP BY s, t');
        drawDots();
        sortStates();
        drawArcs();
        computeRanks();
        drawBarGraph();
        if (selectedState) {
            selectState(selectedState);
        } else {
            colorMap(stateSum);
        }
    }
    var foodChart;
    var foodDataMean;
    var foodDataMean2;
    var transDataMean;
    var transportChart;
    function barGraphData(national) {
        var whereI = queryWhere();
        var whereE = whereI;
        if (!national && selectedState) {
            if (whereI) {
                whereI = whereI + ' and t=\''+selectedState+'\'';
                whereE = whereI + ' and s=\''+selectedState+'\'';
            } else {
                whereI = 'WHERE t=\'' + selectedState + '\'';
                whereE = 'WHERE s=\'' + selectedState + '\'';
            }
        } else {
            national = true;
        }
        var foodI = alasql('SELECT fo, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+whereI+' GROUP BY fo');
        var foodE = alasql('SELECT fo, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+whereE+' GROUP BY fo');
        var transI = alasql('SELECT tr, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+whereI+' GROUP BY tr');
        var transE = alasql('SELECT tr, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+whereE+' GROUP BY tr');
        var foodData = {
            'import': [0,0,0,0,0,0,0,0,0,0],
            'export': [0,0,0,0,0,0,0,0,0,0]
        };
        var i = 0;
        var foodPoint = {'F00': 9, 'F01':0, 'F02':1, 'F03':2,'F04':3,'F05':4,'F06':5,'F07':6,'F08':7,'F09':8};
        var transID = {'T03': 0, 'T04':0, 'T05':0, 'T06':0,'T07':0,'T08':0,'T09':0,'T10':0,'T101':0,'T11':0, 'T14':0,'T00':0};
        var transED = {'T03': 0, 'T04':0, 'T05':0, 'T06':0,'T07':0,'T08':0,'T09':0,'T10':0,'T101':0,'T11':0, 'T14':0,'T00':0};
        var mean = [0,0,0,0,0,0,0,0,0,0];
        var foodMax = 0;
        for (i=0; i < foodI.length; i++) {
            if (foodI[i]['w'] > foodMax) {
                foodMax = foodI[i]['w'];
            }
            foodData['import'][foodPoint[foodI[i]['fo']]] = foodI[i]['w']/ stateSumNorm[dotsIndex][4];
            mean[foodPoint[foodI[i]['fo']]] = foodI[i]['w'] / 51/ stateSumNorm[dotsIndex][4];
        }
        for (i=0; i < foodE.length; i++) {
            if (foodE[i]['w'] > foodMax) {
                foodMax = foodE[i]['w'];
            }
            foodData['export'][foodPoint[foodE[i]['fo']]] = foodE[i]['w']/ stateSumNorm[dotsIndex][4];
            //foodDataMean['export'][foodPoint[foodE[i]['fo']]] = foodE[i]['w'] / 51;
        }
        if (national) {
            foodDataMean = [
                [mean[0], mean[0]],
                [mean[1], mean[1]],
                [mean[2], mean[2]],
                [mean[3], mean[3]],
                [mean[4], mean[4]],
                [mean[5], mean[5]],
                [mean[6], mean[6]],
                [mean[7], mean[7]],
                [mean[8], mean[8]],
                [mean[9], mean[9]]
            ];
            foodDataMean2 = [
                [mean[0], mean[0]],
                [mean[1], mean[1]],
                [mean[2], mean[2]],
                [mean[3], mean[3]],
                [mean[4], mean[4]],
                [mean[5], mean[5]],
                [mean[6], mean[6]],
                [mean[7], mean[7]],
                [mean[8], mean[8]],
                [mean[9], mean[9]]
            ];
        }
        for (i=0; i < transI.length; i++) {
            transID[transI[i]['tr']] = transI[i]['w']/ stateSumNorm[dotsIndex][4];
        }
        for (i=0; i < transE.length; i++) {
            transED[transE[i]['tr']] = transE[i]['w']/ stateSumNorm[dotsIndex][4];
        }
        if (national) {
            transDataMean = {
                'parcel': [transID['T14'] / 51, transID['T14'] / 51],
                'rail': [transID['T06'] / 51, transID['T06'] / 51],
                'water': [
                    (transID['T07'] + transID['T08'] + transID['T09'] + transID['T10'] + transID['T101']) / 51,
                    (transID['T07'] + transID['T08'] + transID['T09'] + transID['T10'] + transID['T101']) / 51
                ],
                'air': [transID['T11'] / 51, transID['T11'] / 51],
                'truck': [
                    (transID['T03'] + transID['T04'] + transID['T05']) / 51,
                    (transID['T03'] + transID['T04'] + transID['T05']) / 51
                ],
                'undefined': [transID['T00'] / 51, transID['T00'] / 51]
            };
        }
        return [foodData, transID, transED];
    }
    function drawYearBarGraph()
    {
        var whereI = queryWhere();
        var whereE = whereI;
        var iWeight = [0,0,0,0], eWeight = [0,0,0,0], tempI, tempE;
        var years = [1997, 2002, 2007, 2012];
        if (selectedState) {
            if (whereI) {
                whereI = whereI + ' and t=\''+selectedState+'\'';
                whereE = whereI + ' and s=\''+selectedState+'\'';
            } else {
                whereI = 'WHERE t=\'' + selectedState + '\'';
                whereE = 'WHERE s=\'' + selectedState + '\'';
            }
        }
        var max = 0;
        for (var i = 0; i < years.length; i++) {
            if (selectedState) {
                tempI = alasql('SELECT SUM(' + dotsIndex + ') AS w FROM stateFlow' + years[i] + ' ' + whereI);
                tempE = alasql('SELECT SUM(' + dotsIndex + ') AS w FROM stateFlow' + years[i] + ' ' + whereE);
            } else {
                tempI = tempE = alasql('SELECT SUM('+dotsIndex+') AS w FROM stateFlow'+years[i]+' '+whereE);
            }
            iWeight[i] = tempI[0]['w'] ? tempI[0]['w'] : 0;
            eWeight[i] = tempE[0]['w'] ? tempE[0]['w'] : 0;
            var temp = iWeight[i] + eWeight[i];
            if (max < temp) {
                max = temp;
            }
        }
        for (i = 0; i < years.length; i++) {
            var iHeight = Math.floor(iWeight[i]/max*90);
            var eHeight = Math.floor(eWeight[i]/max*90);
            $("#i"+years[i]).attr('height', iHeight).attr('y', 100-iHeight);
            $("#e"+years[i]).attr('height', eHeight).attr('y', 100-iHeight-eHeight);
            $("#t"+years[i]).attr('y', 100-iHeight-eHeight-2).text(abbrNum((iWeight[i]+eWeight[i])/stateSumNorm[dotsIndex][4], 1));
        }
    }
    function drawBarGraph()
    {
        drawYearBarGraph();
        if (selectedState) {
            // calculate national data as an extra run
            barGraphData(true);
        }
        var data = barGraphData(false);
        var foodData = data[0];
        var transID = data[1];
        var transED = data[2];

        if (!foodChart) {
            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                },
                chart: {
                    style: {
                        fontFamily: 'Roboto'
                    }
                },
                xAxis: {
                    lineColor: '#E1E4E7',
                    tickColor: '#E1E4E7',
                    labels: {
                        style: {
                            color: '#5F6872',
                        }
                    }
                },
                yAxis: {
                    lineColor: '#E1E4E7',
                    gridLineColor: '#E1E4E7',
                    labels: {
                        style: {
                            color: '#A0A5AF',
                        }
                    }
                }
            });
            foodChart = Highcharts.chart('foodBar', {
                chart: {
                    type: 'column',
                    height: 330
                },
                title: {text: ''},
                legend: {
                    enabled: false
                },
                xAxis: {
                    categories: [
                        'Animals and Fish', 'Cereal Grains', 'Agricultural Products', 'Product of Animal Origin',
                        'Meat, Poultry, Fish, Seafood, and their preparations', 'Milled Grain Products',
                        'Other Prepared Foodstuffs, and Fats and Oil',
                        'Alcoholic Beverages and Denatured Alcohol',
                        'Tobacco Products', 'Undefined'
                    ]
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    title: {
                        text: null
                    }
                },
                credits: {
                    enabled: false
                },

                tooltip: {
                    backgroundColor: '#152740',
                    borderRadius: 0,
                    borderWidth: 0,
                    style: { 'color': '#fff', 'fontWeight': 'normal', 'lineHeight': '18px'},
                    headerFormat: '<b>{point.key}</b><br>',
                    pointFormat: '{series.name}: {point.y:,.1f}<br>',
                    shared: true,
                    useHTML: false
                },

                plotOptions: {
                    series: {
                        borderWidth: 1,
                        pointWidth: 8
                    }
                },

                series: [{
                    name: 'Import',
                    data: foodData['import'],
                    color: '#305068'
                }, {
                    name: 'Import Mean',
                    type: 'errorbar', visible: false,
                    data: foodDataMean,
                    color: '#ed5950',
                    whiskerLength: 8,
                    whiskerWidth: '1'
                }, {
                    name: 'Export',
                    data: foodData['export'],
                    color: '#9ecbea'
                }, {
                    name: 'Export Mean',
                    type: 'errorbar', visible: false,
                    data: foodDataMean,
                    color: '#ed5950',
                    whiskerLength: 8,
                    whiskerWidth: '1'
                }]
            });

            //foodChart.legend.group.hide();
            //foodChart.legend.box.hide();
            transportChart = Highcharts.chart('transportBar', {
                chart: {
                    type: 'column',
                    height: 290
                },
                title: {text: ''},
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: [
                        'Truck', 'Rail', 'Water', 'Air', 'Parcel', 'Undefined'
                    ]
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    title: {
                        text: null
                    }
                },

                tooltip: {
                    backgroundColor: '#152740',
                    borderRadius: 0,
                    borderWidth: 0,
                    style: { 'color': '#fff', 'fontWeight': 'normal', 'lineHeight': '18px'},
                    formatter: function () {
                        var cat = '';
                        if (this.series.options.stack) {
                            cat = ' ('+this.series.options.stack+')';
                        }
                        var tip = '<b>' + this.x + cat +'</b><br/>' +
                            this.series.name + ': ';
                        if (this.y >= 10) {
                            tip += this.y.toLocaleString('en-US', {'maximumFractionDigits': 0});
                        } else if (this.y > 1) {
                            tip += this.y.toLocaleString('en-US', {'maximumFractionDigits': 1});
                        } else {
                            tip += this.y.toLocaleString('en-US', {'maximumFractionDigits': 2});
                        }
                        if (this.point.stackTotal) {
                            if (this.point.stackTotal >= 10) {
                                tip += '<br/>Total: ' + this.point.stackTotal.toLocaleString('en-US', {'maximumFractionDigits': 0});
                            } else if (this.point.stackTotal > 1) {
                                tip += '<br/>Total: ' + this.point.stackTotal.toLocaleString('en-US', {'maximumFractionDigits': 1});
                            } else {
                                tip += '<br/>Total: ' + this.point.stackTotal.toLocaleString('en-US', {'maximumFractionDigits': 2});
                            }
                        }
                        return '<div class="tooltip-text">' + tip + '</div>';
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    },
                    series: {
                        borderWidth: 1,
                        pointWidth: 14
                    }
                },

                series: [
                    {name: 'Truck', data: [transID['T03']], stack: 'import', color: '#B5C0C8'},
                    {name: 'Truck', data: [transED['T03']], stack: 'export', color: '#C5E0F2'},
                    {name: 'For-hire Truck', data: [transID['T04']], stack: 'import', color: '#597386'},
                    {name: 'For-hire Truck', data: [transED['T04']], stack: 'export', color: '#B1D5EE'},
                    {name: 'Private Truck', data: [transID['T05']], stack: 'import', color: '#305068'}, {
                        name: 'Import Mean', type: 'errorbar', visible: false, data: [transDataMean['truck']],
                        color: '#ed5950', whiskerLength: '95%', whiskerWidth: '1', stack: 'import'
                    },
                    {name: 'Private Truck', data: [transED['T05']], stack: 'export', color: '#9ECBEA'}, {
                        name: 'Export Mean', type: 'errorbar', visible: false, data: [transDataMean['truck']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'export'
                    },


                    {name: 'Rail', data: [null, transID['T06']], stack: 'import', color: '#305068'}, {
                        name: 'Import Mean', type: 'errorbar', visible: false, data: [null, transDataMean['rail']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'import'
                    },
                    {name: 'Rail', data: [null, transED['T06']], stack: 'export', color: '#9ECBEA'}, {
                        name: 'Export Mean', type: 'errorbar', visible: false, data: [null, transDataMean['rail']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'export'
                    },


                    {name: 'Water', data: [null, null, transID['T07']], stack: 'import', color: '#ACB9C3'},
                    {name: 'Water', data: [null, null, transED['T07']], stack: 'export', color: '#ECF5FB'},
                    {name: 'Inland Water', data: [null, null, transID['T08']], stack: 'import', color: '#E1E6E9'},
                    {name: 'Inland Water', data: [null, null, transED['T08']], stack: 'export', color: '#D8EAF7'},
                    {name: 'Great Lakes', data: [null, null, transID['T09']], stack: 'import', color: '#B5C0C8'},
                    {name: 'Great Lakes', data: [null, null, transED['T09']], stack: 'export', color: '#C5E0F2'},
                    {name: 'Deep Sea', data: [null, null, transID['T10']], stack: 'import', color: '#597386'},
                    {name: 'Deep Sea', data: [null, null, transED['T10']], stack: 'export', color: '#B1D5EE'},
                    {name: 'Multiple Waterways', data: [null, null, transID['T101']], stack: 'import', color: '#305068'}, {
                        name: 'Import Mean', type: 'errorbar', visible: false, data: [null, null, transDataMean['water']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'import'
                    },
                    {name: 'Multiple Waterways', data: [null, null, transED['T101']], stack: 'export', color: '#9ECBEA'}, {
                        name: 'Export Mean', type: 'errorbar', visible: false, data: [null, null, transDataMean['water']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'export'
                    },



                    {name: 'Air (includes truck & air)', data: [null, null, null, transID['T11']], stack: 'import', color: '#305068'}, {
                        name: 'Import Mean', type: 'errorbar', visible: false, data: [null, null, null, transDataMean['air']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'import'
                    },
                    {name: 'Air (includes truck & air)', data: [null, null, null, transED['T11']], stack: 'export', color: '#9ECBEA'}, {
                        name: 'Export Mean', type: 'errorbar', visible: false, data: [null, null, null, transDataMean['air']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'export'
                    },

                    {name: 'Parcel', data: [null, null, null, null, transID['T14']], stack: 'import', color: '#305068'}, {
                        name: 'Import Mean', type: 'errorbar', visible: false, data: [null, null, null, null, transDataMean['parcel']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'import'
                    },
                    {name: 'Parcel', data: [null, null, null, null, transED['T14']], stack: 'export', color: '#9ECBEA'}, {
                        name: 'Export Mean', type: 'errorbar', visible: false, data: [null, null, null, null, transDataMean['parcel']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'export'
                    },

                    {name: 'Undefined', data: [null, null, null, null, null, transID['T00']], stack: 'import', color: '#305068'}, {
                        name: 'Import Mean', type: 'errorbar', visible: false, data: [null, null, null, null, null, transDataMean['undefined']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'import'
                    },
                    {name: 'Undefined', data: [null, null, null, null, null, transED['T00']], stack: 'export', color: '#9ECBEA'}, {
                        name: 'Export Mean', type: 'errorbar', visible: false, data: [null, null, null, null, null, transDataMean['undefined']],
                        color: '#ed5950', whiskerLength: 14, whiskerWidth: '1', stack: 'export'
                    }
                ]
            });

            //transportChart.legend.group.hide();
            //transportChart.legend.box.hide();
        } else {
            var showMean = selectedState ? true : false;
            foodChart.series[0].setData(foodData['import'], false);
            foodChart.series[1].setData(foodDataMean, false);
            foodChart.series[1].setVisible(showMean, false);
            foodChart.series[2].setData(foodData['export'], false);
            foodChart.series[3].setData(foodDataMean2, false);
            foodChart.series[3].setVisible(showMean, false);
            foodChart.redraw();
            transportChart.series[0].setData([transID['T03']], false);
            transportChart.series[1].setData([transED['T03']], false);
            transportChart.series[2].setData([transID['T04']], false);
            transportChart.series[3].setData([transED['T04']], false);
            transportChart.series[4].setData([transID['T05']], false);
            transportChart.series[5].setData([transDataMean['truck']], false);
            transportChart.series[5].setVisible(showMean, false);
            transportChart.series[6].setData([transED['T05']], false);
            transportChart.series[7].setData([transDataMean['truck']], false);
            transportChart.series[7].setVisible(showMean, false);
            transportChart.series[8].setData([null, transID['T06']], false);
            transportChart.series[9].setData([null, transDataMean['rail']], false);
            transportChart.series[9].setVisible(showMean, false);
            transportChart.series[10].setData([null, transED['T06']], false);
            transportChart.series[11].setData([null, transDataMean['rail']], false);
            transportChart.series[11].setVisible(showMean, false);
            transportChart.series[12].setData([null, null, transID['T07']], false);
            transportChart.series[13].setData([null, null, transED['T07']], false);
            transportChart.series[14].setData([null, null, transID['T08']], false);
            transportChart.series[15].setData([null, null, transED['T08']], false);
            transportChart.series[16].setData([null, null, transID['T09']], false);
            transportChart.series[17].setData([null, null, transED['T09']], false);
            transportChart.series[18].setData([null, null, transID['T10']], false);
            transportChart.series[19].setData([null, null, transED['T10']], false);
            transportChart.series[20].setData([null, null, transID['T101']], false);
            transportChart.series[21].setData([null, null, transDataMean['water']], false);
            transportChart.series[21].setVisible(showMean, false);
            transportChart.series[22].setData([null, null, transED['T101']], false);
            transportChart.series[23].setData([null, null, transDataMean['water']], false);
            transportChart.series[23].setVisible(showMean, false);
            transportChart.series[24].setData([null, null, null, transID['T11']], false);
            transportChart.series[25].setData([null, null,  null, transDataMean['air']], false);
            transportChart.series[25].setVisible(showMean, false);
            transportChart.series[26].setData([null, null, null, transED['T11']], false);
            transportChart.series[27].setData([null, null,  null, transDataMean['air']], false);
            transportChart.series[27].setVisible(showMean, false);
            transportChart.series[28].setData([null, null, null, null, transID['T14']], false);
            transportChart.series[29].setData([null, null, null, null, transDataMean['truck']], false);
            transportChart.series[29].setVisible(showMean, false);
            transportChart.series[30].setData([null, null, null, null, transED['T14']], false);
            transportChart.series[31].setData([null, null, null, null, transDataMean['truck']], false);
            transportChart.series[31].setVisible(showMean, false);
            transportChart.series[32].setData([null, null, null, null, null, transID['T00']], false);
            transportChart.series[33].setData([null, null, null, null, null, transDataMean['undefined']], false);
            transportChart.series[33].setVisible(showMean, false);
            transportChart.series[34].setData([null, null, null, null, null, transED['T00']], false);
            transportChart.series[35].setData([null, null, null, null, null, transDataMean['undefined']], false);
            transportChart.series[35].setVisible(showMean, false);
            transportChart.redraw();
        }
    }
    function stateClick() {
        selectState($(this).data('state'));
        drawBarGraph();
    }
    function stateChange() {
        var val = $('#stateSelect').val();
        if (val == 'all') {
            unselectState();
        } else {
            selectState(val);
        }
        drawBarGraph();
    }
    var selectedState = null;
    function unselectState() {
        $('#'+selectedState+'StateBox').removeClass('selected');
        $('#plotMap').find('.selected').removeClass('selected');
        $('#selectedArc').empty();
        selectList.stateSelect[0].selectize.setValue('all', true);
        selectedState = null;
        $('#selectedState').hide();
        $('span.state').text('U.S.');
        $('.noState').show();
        $('.withState').hide();
        $('#mapSVG').children('g').removeClass('dim');
        $('.stateCircleSelf').remove();
        colorMap(stateSum);
    }
    function abbrNum(number, decPlaces) {
        // This function credit JeffB: http://stackoverflow.com/a/2686098/3854385
        // 2 decimal places => 100, 3 => 1000, etc
        decPlaces = Math.pow(10,decPlaces);
        if (number == 0) {
            return 0;
        }
        number = Math.round(number*decPlaces)/decPlaces;

        // Enumerate number abbreviations
        var abbrev = [ "k", "m", "b", "t" ];

        // Go through the array backwards, so we do the largest first
        for (var i=abbrev.length-1; i>=0; i--) {

            // Convert array index to "1000", "1000000", etc
            var size = Math.pow(10,(i+1)*3);

            // If the number is bigger or equal do the abbreviation
            if(size <= number) {
                // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                // This gives us nice rounding to a particular decimal place.
                number = Math.round(number*decPlaces/size)/decPlaces;

                // Handle special case where we round up to the next abbreviation
                if((number == 1000) && (i < abbrev.length - 1)) {
                    number = 1;
                    i++;
                }

                // Add the letter for the abbreviation
                number += abbrev[i];

                // We are done... stop
                break;
            }
        }

        if (number == 0) {
            return "<0.1";
        }

        return number;
    }
    function selectState(state) {
        stateHoverOut();
        var arcG = $('#selectedArc');
        if (selectedState) {
            unselectState();
        }
        selectedState = state;
        selectList.stateSelect[0].selectize.setValue(state, true);
        $('span.state').text(state);
        $('.noState').hide();
        $('.withState').show();
        var stateBox = $('#'+state+'StateBox');
        stateBox.addClass('selected');
        var where = queryWhere();
        if (where) {
            where += ' AND ';
        } else {
            where = 'WHERE ';
        }
        where += ' (s="'+state+'" OR t="'+state+'")';
        var arcs = alasql('SELECT s, t, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+where+' GROUP BY s, t');
        var arcs2 = [];
        $('#mapSVG').children('g').addClass('dim');
        $('#stateMap'+state).addClass('selected').removeClass('dim');

        for (var i = 0; i < arcs.length; i++) {
            if (arcs[i]['s'] == arcs[i]['t']) {
                var size2 = Math.round(arcs[i]['w']/stateSumNorm[dotsIndex][1])/10;
                if (size2 < 1) {
                    size2 = 1;
                }
                if (size2 > 5) {
                    size2 = 5
                }
                stateBox.prepend(
                    // Add the Big Circle
                    $(document.createElementNS("http://www.w3.org/2000/svg", "circle"))
                        .attr('cx', 12)
                        .attr('cy', 8).attr('r', size2+10).addClass('stateCircleSelf')
                );
            } else if (arcs[i]['s'] == state) {
                arcs2.push([arcs[i]['w'], arcs[i]['t'], 'export-line']);
                $('#stateMap'+arcs[i].t).removeClass('dim');
            } else {
                arcs2.push([arcs[i]['w'], arcs[i]['s'], 'import-line']);
                $('#stateMap'+arcs[i].s).removeClass('dim');
            }
        }
        arcs2.sort(function(a,b) { return b[0] - a[0]; });
        for (i = 0; i < arcs2.length; i++) {
            // Draw Arc
            var size = Math.round(arcs2[i][0]/stateSumNorm[dotsIndex][2]*10)/10;
            if (size < 1) {
                size = 1;
            } else if (size > 20) {
                size = 20;
            }
            var state1 = states[state]*25-25+14;
            var state2 = states[arcs2[i][1]]*25-25+14;
            var xmove = 0;
            if (state1 < state2) {
                xmove = state2-state1;
            } else {
                xmove = state1 - state2;
                state1 = state2;
            }
            arcG.append(
                $(document.createElementNS("http://www.w3.org/2000/svg", "path"))
                //.attr('id', arcData[i]['s']+'ToSelf')
                    .attr('class', arcs2[i][2])
                    // rx ry x-axis-rotation large-arc-flag sweep-flag x y
                    .attr('d', 'M '+state1+' 380 a 1.7 1 0 0 1 '+xmove+' 0')
                    .attr('stroke-width', size)

            );
        }
        arcG.find('path').addClass('color');
        buildStateTable(state);
    }
    function buildStateTable(state) {
        var whereI = queryWhere();
        var whereE = whereI;
        if (whereI) {
            whereI = whereI + ' and t=\''+selectedState+'\'';
            whereE = whereI + ' and s=\''+selectedState+'\'';
        } else {
            whereI = 'WHERE t=\'' + selectedState + '\'';
            whereE = 'WHERE s=\'' + selectedState + '\'';
        }
        var data1 = alasql('SELECT s, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+whereI+' GROUP BY s');
        var data2 = alasql('SELECT t, SUM('+dotsIndex+') AS w FROM stateFlow'+graphYear+' '+whereE+' GROUP BY t');
        var fo1, fo2;
        var shade = $('#shade').data('value');
        var sStateSum = {};
        Object.keys(statesAlpha).forEach(function(key) {
            sStateSum[key] = {'e': 0, 'i': 0}
        });

        for (var i = 0; i < data1.length; i++) {
            if (data1[i].s) {
                sStateSum[data1[i].s]['i'] = data1[i]['w']
            }
        }
        for (i = 0; i < data2.length; i++) {
            if (data2[i].t) {
                sStateSum[data2[i].t]['e'] = data2[i]['w']
            }
        }
        colorMap(sStateSum);
        var stateRankIa = [];
        var stateRankEa = [];
        Object.keys(states).forEach(function (key) {
            stateRankIa.push([sStateSum[key]['i'], key]);
            stateRankEa.push([sStateSum[key]['e'], key]);
        });
        stateRankIa.sort(function (a, b) { return b[0]-a[0]; });
        stateRankEa.sort(function (a, b) { return b[0]-a[0]; });
        var div = $('#selectedState');
        var cols = 4;
        if (shade == 'IE') {
            div.addClass('IE');
            cols = 2;
        } else {
            div.removeClass('IE');
        }
        div.find('.name').text(stateAbbr[state]);
        var table = $('#sameState');
        table.empty();
        if (shade == 'Food') {
            fo1 = alasql('SELECT fo, SUM(' + dotsIndex + ') AS w FROM stateFlow' + graphYear + ' ' + whereE + ' AND t = \''+state+'\' GROUP BY fo');
            columns = [];
            for (j = 0; j < fo1.length; j++) {
                if (fo1[j].w / stateSumNorm[dotsIndex][4] < 0.0001) {
                    continue;
                }
                columns.push([formatTableNumber(fo1[j].w / stateSumNorm[dotsIndex][4]), fo1[j].fo.toLowerCase()])
            }
            columns.sort(function(a,b) {
                if (a[1] == 'f00') {
                    return 10;
                } else if (b[1] == 'f00') {
                    return -10;
                }
                return parseInt(a[1].substr(1)) - parseInt(b[1].substr(1));
            });
            table.append(buildStateRow(state, state, columns, cols));
        } else {
            table.append(buildStateRow(state, state, [
                [formatTableNumber(sStateSum[state]['i'] / stateSumNorm[dotsIndex][4]), 'importDot'],
                [formatTableNumber(sStateSum[state]['e'] / stateSumNorm[dotsIndex][4]), 'exportDot']
            ], cols));
        }
        table = $('#importState');
        table.empty();
        var graphed = false;
        var columns, j;
        for (i = 0; i < stateRankIa.length; i++) {
            if (stateRankIa[i][1] == state || sStateSum[stateRankIa[i][1]]['i'] / stateSumNorm[dotsIndex][4] < 0.0001) {
                continue;
            }
            graphed = true;

            if (shade == 'Food') {
                fo1 = alasql('SELECT fo, SUM(' + dotsIndex + ') AS w FROM stateFlow' + graphYear + ' ' + whereI + ' AND s = \''+stateRankIa[i][1]+'\' GROUP BY fo');
                columns = [];
                for (j = 0; j < fo1.length; j++) {
                    if (fo1[j].w / stateSumNorm[dotsIndex][4] < 0.0001) {
                        continue;
                    }
                    columns.push([formatTableNumber(fo1[j].w / stateSumNorm[dotsIndex][4]), fo1[j].fo.toLowerCase()])
                }
                columns.sort(function(a,b) {
                    if (a[1] == 'f00') {
                        return 10;
                    } else if (b[1] == 'f00') {
                        return -10;
                    }
                    return parseInt(a[1].substr(1)) - parseInt(b[1].substr(1));
                });
                table.append(buildStateRow(stateRankIa[i][1], state, columns, cols));
            } else {
                table.append(buildStateRow(stateRankIa[i][1], state, [
                    [formatTableNumber(sStateSum[stateRankIa[i][1]]['i'] / stateSumNorm[dotsIndex][4]), 'importDot'],
                    [formatTableNumber(sStateSum[stateRankIa[i][1]]['e'] / stateSumNorm[dotsIndex][4]), 'exportDot']
                ], cols));
            }
        }
        if (!graphed) {
            table.parents('div.table').hide();
        } else {
            table.parents('div.table').show();
        }

        table = $('#exportState');
        table.empty();
        graphed = false;
        for (i = 0; i < stateRankEa.length; i++) {
            if (stateRankEa[i][1] == state || sStateSum[stateRankEa[i][1]]['e'] / stateSumNorm[dotsIndex][4] < 0.0001) {
                continue;
            }
            graphed = true;

            if (shade == 'Food') {
                fo1 = alasql('SELECT fo, SUM(' + dotsIndex + ') AS w FROM stateFlow' + graphYear + ' ' + whereE + ' AND t = \''+stateRankEa[i][1]+'\' GROUP BY fo');
                columns = [];
                for (j = 0; j < fo1.length; j++) {
                    if (fo1[j].w / stateSumNorm[dotsIndex][4] < 0.0001) {
                        continue;
                    }
                    columns.push([formatTableNumber(fo1[j].w / stateSumNorm[dotsIndex][4]), fo1[j].fo.toLowerCase()])
                }
                columns.sort(function(a,b) {
                    if (a[1] == 'f00') {
                        return 10;
                    } else if (b[1] == 'f00') {
                        return -10;
                    }
                    return parseInt(a[1].substr(1)) - parseInt(b[1].substr(1));
                });
                table.append(buildStateRow(stateRankIa[i][1], state, columns, cols));
            } else {
                table.append(buildStateRow(state, stateRankEa[i][1], [
                    [formatTableNumber(sStateSum[stateRankEa[i][1]]['i'] / stateSumNorm[dotsIndex][4]), 'importDot'],
                    [formatTableNumber(sStateSum[stateRankEa[i][1]]['e'] / stateSumNorm[dotsIndex][4]), 'exportDot']
                ], cols));
            }
        }
        if (!graphed) {
            table.parents('div.table').hide();
        } else {
            table.parents('div.table').show();
        }
        div.show();
    }
    function formatTableNumber(number) {
        if (number == 0) {
            return '0';
        }
        number = Math.round(number*1000)/1000;
        if (number < 0.01) {
            return '<0.01';
        } else {
            return number.toPrecision(3).substr(0,5);
        }
    }
    function buildSectionRow() {
        return $("<tr>").append(
            $("<td>").attr('colspan', 6).append(
                $("<div>").attr('class', 'section')
            )
        )
    }
    function buildStateRow(state1, state2, numbers, cols) {
        var row = [$("<tr>").append(
            $("<td>").attr('class', 'state').html(state1+"&rarr;"+state2)
        )];
        for (var i = 0; i < numbers.length; i++) {
            var classes = 'number';
            if (i % cols != cols - 1) {
                classes = 'number smallW';
            }
            row[row.length - 1].append(
                $("<td>").attr('class', classes).append(
                    $("<span>").attr('class', numbers[i][1]+' tableDot').html('&#9679;')
                ).append(" "+numbers[i][0])
            );
            if (i % 4 == 3 && i != numbers.length - 1) {
                row.push($("<tr>").append(
                    $("<td>").attr('class', 'state').html("&nbsp;")
                ));
            }
        }
        if (numbers.length % cols > 0) {
            for (i = numbers.length % cols; i < cols; i++) {
                classes = 'number';
                if (i % cols != cols - 1) {
                    classes = 'number smallW';
                }
                row[row.length - 1].append(
                    $("<td>").attr('class', classes).html('&nbsp;')
                );
            }
        }
        return row;
    }
    function stateHoverIn() {
        if (selectedState) {
            return;
        }
        var item = $('#hoverState');
        var state = $(this).data('state');
        $('#'+state+'StateBox').addClass('hovered');
        item.css('left', states[state]*25-25-50);
        var im = stateSum[state]['i'] / stateSumNorm[dotsIndex][4];
        if (im > 100) {
            im = im.toLocaleString('en-US', {'maximumFractionDigits': 0});
        } else {
            im = im.toPrecision(3);
        }
        $('#hoverImport').text(im);
        $('#hoverExport').text((stateSum[state]['e'] / stateSumNorm[dotsIndex][4]).toPrecision(3));
        $('#hoverImportRank').text(stateRankI[state]);
        $('#hoverExportRank').text(stateRankE[state]);
        $('#hoverStateName').text(stateAbbr[state]);
        //$('#hoverStateName').text(state+' - '+ stateAbbr[state]);
        //item.stop().fadeIn(200);
        item.show();
    }
    function stateHoverOut() {
        //$('#hoverState').stop().show(200);
        $('.hovered').removeClass('hovered');
        $('#hoverState').hide();
    }
    function addDot(box, i, extra, className) {
        box.append(
            $(document.createElementNS("http://www.w3.org/2000/svg", "circle"))
                .attr('cx', ((i + extra) % 4) * 5 + 4)
                .attr('cy', Math.floor((i+extra)/4) * 5).attr('r', 2).addClass(className)
        );
    }


    //add progress indicator -- ellie
    NProgress.configure({ showSpinner: false });
    NProgress.configure({ minimum: 0.1 });
    $(document)
        .ajaxStart(function() {
            NProgress.start();
        })
        .ajaxComplete(function(event,request, settings) {
            NProgress.done();
        });

    //add product tour -- ellie
    function startIntro(){

        if(!(Cookies.get('isTourDone') === '1')){
            $('.tour-overlay, .tour-content').show();
        }

        //$('.tour-overlay, .tour-content').show();

        $('#tour-done').on('click', function(e){
            e.preventDefault();

            $('.tour-overlay, .tour-content').hide();
            Cookies.set('isTourDone', '1');
        });
    }

})();
