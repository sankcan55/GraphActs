import React, { useRef } from "react";
import * as d3 from "d3";
import "./style.css";

var propData = [];
var users = [];

var userArray = [];

var bar_chart_race;
var chart_container;
var chart_title;
var x_axis;
var y_axis;
var columns;
var current_date;

function BarChartRace(props) {
  bar_chart_race = useRef();
  chart_container = useRef();
  chart_title = useRef();
  x_axis = useRef();
  y_axis = useRef();
  columns = useRef();
  current_date = useRef();

  propData = props.data;
  users = new Set();
  for (let i = 0; i < propData.length; i++) {
    users.add(propData[i][0].handle);
  }
  userArray = [...users];
  // console.log("propData >>>>>>>>> ", propData);
  // console.log("users >>>>>>>>>>> ", userArray);
  var myChart;
  if (userArray.length > 0) {
    myChart = new BarChartGenatator("bar-chart-race");
    myChart
      .setTitle("Bar Chart Race Title")
      .addDatasets(generateDataSets())
      .render();
  }

  d3.select(".btn").on("click", function () {
    if (this.innerHTML === "Stop") {
      this.innerHTML = "Resume";
      myChart.stop();
    } else if (this.innerHTML === "Resume") {
      this.innerHTML = "Stop";
      myChart.start();
    } else {
      this.innerHTML = "Stop";
      myChart.render();
    }
  });

  return (
    <>
      <button className="btn">Stop</button>
      <svg className="bar-chart-race" ref={bar_chart_race}>
        <g className="chart-container" ref={chart_container}>
          <text className="chart-title" ref={chart_title}></text>
          <g className="x-axis" ref={x_axis}></g>
          <g className="y-axis" ref={y_axis}></g>
          <g className="columns" ref={columns}></g>
          <text className="current-date" ref={current_date}></text>
        </g>
      </svg>
    </>
  );
}

function generateDataSets() {
  const dataSet = [];
  const currentYear = +d3.timeFormat("%Y")(new Date());
  const maxLimitForValue = 4000;
  const minLimitForValue = 200;
  const maximumModelCount = 10;
  const size = 5;
  for (let i = 0; i < size; i++) {
    dataSet.push({
      date: currentYear - (size - (i + 1)),
      dataset: userArray
        .sort(function () {
          return Math.random() - 0.5;
        })
        .slice(0, maximumModelCount)
        .map((user) => ({
          name: user,
          value:
            Math.random() * (maxLimitForValue - minLimitForValue) +
            minLimitForValue,
        })),
    });
  }
  // console.log("DataSet >>>>>>>>>>> ", dataSet);
  return dataSet;
}

function BarChartGenatator(chartId, extendedSettings) {
  const chartSettings = {
    width: 1000,
    height: 700,
    padding: 40,
    titlePadding: 5,
    columnPadding: 0.4,
    ticksInXAxis: 5,
    duration: 3500,
    ...extendedSettings,
  };

  chartSettings.innerWidth = chartSettings.width - chartSettings.padding * 2;
  chartSettings.innerHeight = chartSettings.height - chartSettings.padding * 2;

  const chartDataSets = [];
  let chartTransition;
  let timerStart, timerEnd;
  let currentDataSetIndex = 0;
  let elapsedTime = chartSettings.duration;

  const chartContainer = d3.select(`.${chartId} .chart-container`);
  const xAxisContainer = d3.select(`.${chartId} .x-axis`);
  const yAxisContainer = d3.select(`.${chartId} .y-axis`);

  const xAxisScale = d3.scaleLinear().range([0, chartSettings.innerWidth]);

  const yAxisScale = d3
    .scaleBand()
    .range([0, chartSettings.innerHeight])
    .padding(chartSettings.columnPadding);

  d3.select(`.${chartId}`)
    .attr("width", chartSettings.width)
    .attr("height", chartSettings.height);

  chartContainer.attr(
    "transform",
    `translate(${chartSettings.padding} ${chartSettings.padding})`
  );

  chartContainer
    .select(".current-date")
    .attr(
      "transform",
      `translate(${chartSettings.innerWidth} ${chartSettings.innerHeight})`
    );

  function draw({ dataset, date: currentDate }, transition) {
    const { innerHeight, ticksInXAxis, titlePadding } = chartSettings;
    const dataSetDescendingOrder = dataset.sort(
      ({ value: firstValue }, { value: secondValue }) =>
        secondValue - firstValue
    );
    // console.log("dataSetDescendingOrder >>>>>> ", dataSetDescendingOrder);
    chartContainer.select(".current-date").text(currentDate);

    xAxisScale.domain([0, dataSetDescendingOrder[0].value]);
    yAxisScale.domain(dataSetDescendingOrder.map(({ name }) => name));

    xAxisContainer
      .transition(transition)
      .call(d3.axisTop(xAxisScale).ticks(ticksInXAxis).tickSize(-innerHeight));

    yAxisContainer
      .transition(transition)
      .call(d3.axisLeft(yAxisScale).tickSize(0));

    // The general update Pattern in d3.js

    // Data Binding
    const barGroups = chartContainer
      .select(".columns")
      .selectAll("g.column-container")
      .data(dataSetDescendingOrder, ({ name }) => name);

    // Enter selection
    const barGroupsEnter = barGroups
      .enter()
      .append("g")
      .attr("class", "column-container")
      .attr("transform", `translate(0,${innerHeight})`);

    barGroupsEnter
      .append("rect")
      .attr("class", "column-rect")
      .attr("width", 0)
      .attr("height", yAxisScale.step() * (1 - chartSettings.columnPadding));

    barGroupsEnter
      .append("text")
      .attr("class", "column-title")
      .attr("y", (yAxisScale.step() * (1 - chartSettings.columnPadding)) / 2)
      .attr("x", -titlePadding)
      .text(({ name }) => name);

    barGroupsEnter
      .append("text")
      .attr("class", "column-value")
      .attr("y", (yAxisScale.step() * (1 - chartSettings.columnPadding)) / 2)
      .attr("x", titlePadding)
      .text(0);

    // Update selection
    const barUpdate = barGroupsEnter.merge(barGroups);

    barUpdate
      .transition(transition)
      .attr("transform", ({ name }) => `translate(0,${yAxisScale(name)})`)
      .attr("fill", "normal");

    barUpdate
      .select(".column-rect")
      .transition(transition)
      .attr("width", ({ value }) => xAxisScale(value));

    barUpdate
      .select(".column-title")
      .transition(transition)
      .attr("x", ({ value }) => xAxisScale(value) - titlePadding);

    barUpdate
      .select(".column-value")
      .transition(transition)
      .attr("x", ({ value }) => xAxisScale(value) + titlePadding)
      .tween("text", function ({ value }) {
        const interpolateStartValue =
          elapsedTime === chartSettings.duration
            ? this.currentValue || 0
            : +this.innerHTML;

        const interpolate = d3.interpolate(interpolateStartValue, value);
        this.currentValue = value;

        return function (t) {
          d3.select(this).text(Math.ceil(interpolate(t)));
        };
      });

    // Exit selection
    const bodyExit = barGroups.exit();

    bodyExit
      .transition(transition)
      .attr("transform", `translate(0,${innerHeight})`)
      .on("end", function () {
        d3.select(this).attr("fill", "none");
      });

    bodyExit.select(".column-title").transition(transition).attr("x", 0);

    bodyExit.select(".column-rect").transition(transition).attr("width", 0);

    bodyExit
      .select(".column-value")
      .transition(transition)
      .attr("x", titlePadding)
      .tween("text", function () {
        const interpolate = d3.interpolate(this.currentValue, 0);
        this.currentValue = 0;

        return function (t) {
          d3.select(this).text(Math.ceil(interpolate(t)));
        };
      });

    return this;
  }

  function addDataset(dataSet) {
    chartDataSets.push(dataSet);

    return this;
  }

  function addDatasets(dataSets) {
    chartDataSets.push.apply(chartDataSets, dataSets);

    return this;
  }

  function setTitle(title) {
    d3.select(".chart-title")
      .attr("x", chartSettings.width / 2)
      .attr("y", -chartSettings.padding / 2)
      .text(title);

    return this;
  }
  async function render(index = 0) {
    currentDataSetIndex = index;
    timerStart = d3.now();

    chartTransition = chartContainer
      .transition()
      .duration(elapsedTime)
      .ease(d3.easeLinear)
      .on("end", () => {
        if (index < chartDataSets.length) {
          elapsedTime = chartSettings.duration;
          render(index + 1);
        } else {
          d3.select(".btn").text("Play");
        }
      })
      .on("interrupt", () => {
        timerEnd = d3.now();
      });

    if (index < chartDataSets.length) {
      draw(chartDataSets[index], chartTransition);
    }

    return this;
  }

  function stop() {
    d3.select(`.${chartId}`).selectAll("*").interrupt();

    return this;
  }

  function start() {
    elapsedTime -= timerEnd - timerStart;

    render(currentDataSetIndex);

    return this;
  }

  return {
    addDataset,
    addDatasets,
    render,
    setTitle,
    start,
    stop,
  };
}

export default BarChartRace;
