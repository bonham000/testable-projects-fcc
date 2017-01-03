import $ from 'jquery';

export default function createBarChartTests() {
    // returns a random index number
    function getRandomIndex(max) {
        return Math.floor(Math.random() * max);
    }

    describe('#BarChartTests', function() {

        it('1. My chart should have a title with a corresponding id="title".', function() {
            FCC_Global.assert.isNotNull(document.getElementById('title'), 'Could not find element with id="title" ');
        })

        it('2. My Chart should have an x-axis with a corresponding id="x-axis".', function() {
            FCC_Global.assert.isNotNull(document.getElementById('x-axis'), 'Could not find element with id="x-axis" ');

            FCC_Global.assert.isAbove(document.querySelectorAll('g#x-axis').length, 0, 'x-axis should be a <g> SVG element ');
        })

        it('3. My Chart should have a y-axis with a corresponding id="y-axis".', function() {
            FCC_Global.assert.isNotNull(document.getElementById('y-axis'), 'Could not find element with id="y-axis" ');

            FCC_Global.assert.isAbove(document.querySelectorAll('g#y-axis').length, 0, 'y-axis should be a <g> SVG element ');
        })

        it('4. Both axes should contain multiple tick labels.', function() {
            FCC_Global.assert.isAbove($("#x-axis .tick").length, 1, "There are not enough tick labels on the x-axis ");

            FCC_Global.assert.isAbove($("#y-axis .tick").length, 1, "There are not enough tick labels on the y-axis ");
        })

        it('5. My Chart should have a bar for each data point with a corresponding class="bar" displaying the data.', function() {
            FCC_Global.assert.isAbove(document.querySelectorAll('rect.bar').length, 0, 'Could not find any elements with class="bar" ');

            FCC_Global.assert.equal(document.querySelectorAll('rect.bar').length, 275, 'The number of bars is not equal to the number of data points ')
        })

        it('6. Each bar should have the properties "data-date" and "data-gdp" containing date and GDP values.', function() {
            const bars = document.getElementsByClassName('bar');
            FCC_Global.assert.isAtLeast(bars.length, 1, 'no elements with the class of "bar" are detected ');
            for (var i = 0; i < bars.length; i++) {
                var bar = bars[i];
                FCC_Global.assert.isNotNull(bar.getAttribute("data-date"), 'Could not find property "data-date" in bar ')
                FCC_Global.assert.isNotNull(bar.getAttribute("data-gdp"), 'Could not find property "data-gdp" in bar ')
            }
        })

        it('7. The "data-date" properties should match the order of the provided data.', function(done) {
            $.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', function(res) {
                try {
                    const bars = document.getElementsByClassName('bar');
                    FCC_Global.assert.isAtLeast(bars.length, 1, 'no elements with the class of "bar" are detected ');
                    for (var i = 0; i < bars.length; i++) {
                        var currentBarDate = bars[i].getAttribute("data-date");

                        FCC_Global.assert.equal(currentBarDate, res.data[i][0], 'Bars should have date data in the same order as the provided data ')
                    }
                    done();
                } catch (e) {
                    done(e);
                }
            })
        })

        it('8. The "data-gdp" properties should match the order of the provided data.', function(done) {
            $.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', function(res) {
                try {
                    const bars = document.getElementsByClassName('bar');
                    FCC_Global.assert.isAtLeast(bars.length, 1, 'no elements with the class of "bar" are detected ');
                    for (var i = 0; i < bars.length; i++) {
                        var currentBarGdp = bars[i].getAttribute("data-gdp");

                        FCC_Global.assert.equal(currentBarGdp, res.data[i][1], "Bars should have gdp data in the same order as the provided data ")
                    }
                    done();
                } catch (e) {
                    done(e);
                }
            })
        })

        it('9. Each bar\'s height should accurately represent the data\'s corresponding GDP.', function() {
            const bars = document.querySelectorAll('rect.bar');

            // get the ratio of the first data point to the height of the first bar
            const firstRatio = bars[0].getAttribute('data-gdp') / bars[0].getAttribute('height');

            // iterate through each bar and make sure that its height is consistent with its corresponding data point using the first ratio
            // this test completely validates the bars, but isn\'t very useful to the user, so data-date and data-gdp tests were added for clarity
            for (var i = 0; i < bars.length; i++) {
                var dataValue = bars[i].getAttribute('data-gdp');
                var barHeight = bars[i].getAttribute('height');
                var ratio = dataValue / barHeight;

                FCC_Global.assert.equal(firstRatio.toFixed(3), ratio.toFixed(3), 'The heights of the bars should correspond to the data values ')
            }
        })

        it('10. I can mouse over a bar and see a tooltip with corresponding id="tooltip" which displays more information about the data.', function() {
            const firstRequestTimeout = 100;
            const secondRequestTimeout = 2000;
            this.timeout(firstRequestTimeout + secondRequestTimeout + 1000);

            FCC_Global.assert.isNotNull(document.getElementById('tooltip'), 'There should be an element with id="tooltip" ');

            function getToolTipStatus(tooltip) {
                // jQuery's :hidden selector checks if the element or its parents have a display of none, a type of hidden, or height/width set to 0
                // if the element is hidden with opacity=0 or visibility=hidden, jQuery's :hidden will return false because it takes up space in the DOM
                // this test combines jQuery's :hidden with tests for opacity and visbility to cover most use cases (z-index and potentially others are not tested)
                if ($(tooltip).is(':hidden') || tooltip.style.opacity === '0' || tooltip.style.visibility === 'hidden' || tooltip.style.display === 'none') {
                    return 'hidden'
                } else {
                    return 'visible'
                }
            }

            const tooltip = document.getElementById('tooltip');
            const bars = $('.bar');

            // place mouse on random bar and check if tooltip is visible
            const randomIndex = getRandomIndex(bars.length);
            var randomBar = bars[randomIndex];
            randomBar.dispatchEvent(new MouseEvent('mouseover'));

            // promise is used to prevent test from ending prematurely
            return new Promise((resolve, reject) => {
                // timeout is used to accomodate tooltip transitions
                setTimeout(_ => {
                    if (getToolTipStatus(tooltip) !== 'visible') {
                        reject('Tooltip should be visible when mouse is on a bar ');
                    }

                    // remove mouse from bar and check if tooltip is hidden again
                    randomBar.dispatchEvent(new MouseEvent('mouseout'));
                    setTimeout(_ => {
                        if (getToolTipStatus(tooltip) !== 'hidden') {
                            reject('Tooltip should be hidden when mouse is not on a bar ');
                        } else {
                            resolve()
                        }
                    }, secondRequestTimeout)
                }, firstRequestTimeout)
            })
        })

        it('11. My tooltip should have a "data-date" property that corresponds to the given date of the active bar.', function() {
            const tooltip = document.getElementById('tooltip');
            FCC_Global.assert.isNotNull(tooltip.getAttribute("data-date"), 'Could not find property "data-date" in tooltip ');

            const bars = $('.bar');
            const randomIndex = getRandomIndex(bars.length);

            var randomBar = bars[randomIndex];

            randomBar.dispatchEvent(new MouseEvent('mouseover'));

            FCC_Global.assert.equal(tooltip.getAttribute('data-date'), randomBar.getAttribute('data-date'), 'Tooltip\'s "data-date" property should be equal to the active bar\'s "data-date" property ');
        })

    });
}
