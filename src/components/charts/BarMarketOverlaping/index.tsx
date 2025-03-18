import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
// import useSeconds from "@/hooks/useSeconds";
import data from "./data";

const StockVolumeChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  // const seconds = useSeconds();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1200;
    const height = 500;
    const margin = { top: 40, right: 100, bottom: 100, left: 100 };

    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.market))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yVolumeScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.volume)!])
      .range([height - margin.bottom, margin.top]);

    const yTimeScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yVolumeAxis = d3.axisLeft(yVolumeScale).tickFormat(d3.format(".2s"));
    const yTimeAxis = d3.axisRight(yTimeScale).tickFormat((d) => `${d}:00`);

    // Append bars for market volume
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.market)!)
      .attr("y", (d) => yVolumeScale(d.volume))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.bottom - yVolumeScale(d.volume))
      .attr("fill", "steelblue");

    // Append open-close trading lines (pre-market, regular, after-market)
    data.forEach((d) => {
      const xPos = xScale(d.market)! + xScale.bandwidth() / 2;

      const addLine = (y1: number, y2: number, color: number) => {
        svg
          .append("line")
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", yTimeScale(y1))
          .attr("y2", yTimeScale(y2))
          .attr("stroke", color)
          .attr("stroke-width", 2);
      };

      // Handle day changes by drawing from bottom if closeTime < openTime
      const drawSegment = (start:number, end:number, color:number) => {
        if (end < start) {
          // Market closes next day: Draw from start to 24 and from 0 to end
          addLine(start, 24, color);
          addLine(0, end, color);
        } else {
          addLine(start, end, color);
        }
      };

      // Pre-market (Red)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (d.preMarketOpen) drawSegment(d.preMarketOpen, d.openTime, "red" as any );

      // Regular market (Green)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drawSegment(d.openTime, d.closeTime, "green" as any);

      // After-market (Red)
      if (d.afterMarketClose)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drawSegment(d.closeTime, d.afterMarketClose, "red" as any);
    });

    // Get current UTC time
    const now = new Date();
    const currentUtcTime =
      now.toISOString().split("T")[1].split(".")[0] + " UTC";
    const currentUtcHour =
      now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    // Append current time line (solid white)
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yTimeScale(currentUtcHour))
      .attr("y2", yTimeScale(currentUtcHour))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Append current time label
    svg
      .append("text")
      .attr("x", width - margin.right - 50)
      .attr("y", yTimeScale(currentUtcHour) - 5)
      .attr("fill", "white")
      .style("font-size", "12px")
      .text(currentUtcTime);

    // Hover effect: line + time label
    const hoverLine = svg
      .append("line")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("display", "none");

    const hoverLabel = svg
      .append("text")
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("display", "none");

    // Mouse move event to show hover line
    svg.on("mousemove", function (event) {
      const [, mouseY] = d3.pointer(event);
      const timeValue = yTimeScale.invert(mouseY);

      if (timeValue >= 0 && timeValue <= 24) {
        // Convert to HH:MM:ss format
        const hours = Math.floor(timeValue);
        const minutes = Math.floor((timeValue - hours) * 60);
        const seconds = Math.floor(((timeValue - hours) * 60 - minutes) * 60);
        const formattedTime = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")} UTC`;

        hoverLine
          .attr("x1", margin.left)
          .attr("x2", width - margin.right)
          .attr("y1", mouseY)
          .attr("y2", mouseY)
          .style("display", "block");

        hoverLabel
          .attr("x", width - margin.right - 60)
          .attr("y", mouseY - 5)
          .text(formattedTime)
          .style("display", "block");
      }
    });

    // Hide hover effect when leaving
    svg.on("mouseleave", function () {
      hoverLine.style("display", "none");
      hoverLabel.style("display", "none");
    });

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yVolumeAxis);
    svg
      .append("g")
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(yTimeAxis);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
  }, []);

  return (
    <div className="bg-surface-tertiary rounded-2xl ">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default StockVolumeChart;
