"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import * as d3 from "d3"

interface ChartData {
  name: string
  value: number
}

interface AreaChartProps {
  data: ChartData[]
}

export function AreaChart({ data }: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d) => d.value) as number) * 1.2])
      .range([innerHeight, 0])

    const area = d3
      .area<ChartData>()
      .x((d) => (x(d.name) || 0) + x.bandwidth() / 2)
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX)

    const line = d3
      .line<ChartData>()
      .x((d) => (x(d.name) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Градиент для области
    const gradient = g
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", theme === "dark" ? "#3b82f6" : "#3b82f6")
      .attr("stop-opacity", 0.7)

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", theme === "dark" ? "#3b82f6" : "#3b82f6")
      .attr("stop-opacity", 0.1)

    // Ось X
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("fill", theme === "dark" ? "#9ca3af" : "#6b7280")
      .style("font-size", "10px")

    // Ось Y
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d}`),
      )
      .selectAll("text")
      .attr("fill", theme === "dark" ? "#9ca3af" : "#6b7280")
      .style("font-size", "10px")

    // Горизонтальные линии сетки
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-dasharray", "3,3")

    // Область под линией
    g.append("path").datum(data).attr("fill", "url(#area-gradient)").attr("d", area)

    // Линия
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", theme === "dark" ? "#3b82f6" : "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Точки
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.value))
      .attr("r", 4)
      .attr("fill", theme === "dark" ? "#3b82f6" : "#3b82f6")
      .attr("stroke", theme === "dark" ? "#1e3a8a" : "#ffffff")
      .attr("stroke-width", 2)
  }, [data, theme])

  return <svg ref={svgRef} width="100%" height="100%" />
}

interface BarChartProps {
  data: ChartData[]
}

export function BarChart({ data }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 30, bottom: 40, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d) => d.value) as number) * 1.2])
      .range([innerHeight, 0])

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Цвета для столбцов
    const colors = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"]

    // Ось X
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("fill", theme === "dark" ? "#9ca3af" : "#6b7280")
      .style("font-size", "10px")

    // Ось Y
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d}`),
      )
      .selectAll("text")
      .attr("fill", theme === "dark" ? "#9ca3af" : "#6b7280")
      .style("font-size", "10px")

    // Горизонтальные линии сетки
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-dasharray", "3,3")

    // Столбцы
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name) || 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.value))
      .attr("fill", (d, i) => colors[i % colors.length])
      .attr("rx", 4)
      .attr("ry", 4)

    // Значения над столбцами
    g.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .text((d) => d.value)
      .attr("fill", theme === "dark" ? "#e5e7eb" : "#374151")
      .style("font-size", "12px")
      .style("font-weight", "bold")
  }, [data, theme])

  return <svg ref={svgRef} width="100%" height="100%" />
}
