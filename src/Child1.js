import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Child1.css";

const Child1 = ({ data }) => 
{
  const chartRef = useRef();

  useEffect(() => {
    if (data) 
    {
      drawStreamGraph();
    }

    function drawStreamGraph() 
    {
      d3.select(chartRef.current).select("svg").remove();

      const margin = { top: 20, right: 200, bottom: 50, left: 40 };
     
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const keys = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];
      const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];

      const colorScale = d3.scaleOrdinal().domain(keys).range(colors);

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      
        const parseDate = d3.timeParse("%m/%d/%y");
      data.forEach((d) => {
        d.Date = parseDate(d.Date);
        keys.forEach((key) => {
          d[key] = +d[key];
        });
      });

      
      const stack = d3.stack().keys(keys).offset(d3.stackOffsetWiggle);
      const stackedData = stack(data);

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.Date))
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])),
          d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])),
        ])
        .range([height, 0]);

      
        const area = d3
        .area()
        .x((d) => xScale(d.data.Date))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]))
        .curve(d3.curveBasis);

        const legend = svg
        .selectAll(".legend")
        .data(keys)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr(
          "transform",
          (_, i) => `translate(${width + margin.right - 150}, ${(i * 25 ) + height - 100})`
        );

      legend
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", (d) => colorScale(d));

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text((d) => d);
      
      
        const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "10px")

      chart
        .selectAll(".layer")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", (d) => colorScale(d.key))
        .on("mouseover", function (event, d) {
          d3.select(this).style("opacity", 1);

          tooltip
            .style("opacity", 1)
            .style("left", `${event.pageX + 15}px`)
            .style("top", `${event.pageY + 15}px`);

          miniBarChart(d.key, data, colorScale(d.key));
        })
        .on("mousemove", function (event) {
          tooltip.style("left", `${event.pageX + 15}px`).style("top", `${event.pageY + 15}px`);
        })
        .on("mouseout", function () {
          d3.select(this).style("opacity", 1);
          tooltip.style("opacity", 0);
        });

      chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

      function miniBarChart(key, data, color) {
        tooltip.selectAll("*").remove();

        const barWidth = 300;
        const barHeight = 100;
        const barMargin = { top: 10, right: 10, bottom: 20, left: 30 };

        const barSvg = tooltip
          .append("svg")
          .attr("width", 340)
          .attr("height",140)
          .append("g")
          .attr("transform", `translate(${barMargin.left},${barMargin.top})`);

        const monthsInData = Array.from(new Set(data.map((d) => d3.timeFormat("%b")(d.Date))));

        const barX = d3.scaleBand().domain(monthsInData).range([0, barWidth]).padding(0.2);
        const barY = d3.scaleLinear().domain([0, d3.max(data, (d) => d[key])]).range([barHeight, 0]);

        barSvg
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", (d) => barX(d3.timeFormat("%b")(d.Date)))
          .attr("y", (d) => barY(d[key]))
          .attr("width", barX.bandwidth())
          .attr("height", (d) => barHeight - barY(d[key]))
          .attr("fill", color);

        barSvg.append("g").call(d3.axisBottom(barX)).attr("transform", `translate(0, ${barHeight})`);
        barSvg.append("g").call(d3.axisLeft(barY).ticks(5));
      }
    }
  }, [data]);

  return <div ref={chartRef}></div>;
};

export default Child1;
