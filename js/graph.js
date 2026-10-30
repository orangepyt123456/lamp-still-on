const SVG = "http://www.w3.org/2000/svg";

export function mountGraph(container, nodes, edges, onSelect) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 360 500");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "这一夜的知识图谱");

  const edgeEls = edges.map(([a, b]) => {
    const na = nodes.find((n) => n.id === a);
    const nb = nodes.find((n) => n.id === b);
    const line = document.createElementNS(SVG, "line");
    line.setAttribute("x1", na.x);
    line.setAttribute("y1", na.y);
    line.setAttribute("x2", nb.x);
    line.setAttribute("y2", nb.y);
    line.setAttribute("class", "g-edge");
    line.dataset.a = a;
    line.dataset.b = b;
    svg.appendChild(line);
    return line;
  });

  const nodeEls = nodes.map((node) => {
    const g = document.createElementNS(SVG, "g");
    g.setAttribute("class", `g-node${node.status === "undetermined" ? " undetermined" : ""}`);
    g.dataset.id = node.id;
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", node.label);

    const ring = document.createElementNS(SVG, "circle");
    ring.setAttribute("cx", node.x);
    ring.setAttribute("cy", node.y);
    ring.setAttribute("r", "28");
    ring.setAttribute("class", "ring");

    const text = document.createElementNS(SVG, "text");
    text.setAttribute("x", node.x);
    text.setAttribute("y", node.y + 48);
    text.setAttribute("text-anchor", "middle");
    text.textContent = node.label;

    g.append(ring, text);
    g.addEventListener("click", () => onSelect(node.id));
    g.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(node.id);
      }
    });
    svg.appendChild(g);
    return g;
  });

  container.appendChild(svg);

  return {
    setRelated(ids) {
      const set = new Set(ids);
      nodeEls.forEach((el) => el.classList.toggle("related", set.has(el.dataset.id)));
      edgeEls.forEach((el) => {
        el.classList.toggle("related", set.has(el.dataset.a) && set.has(el.dataset.b));
      });
    },
    setActive(id) {
      nodeEls.forEach((el) => el.classList.toggle("on", el.dataset.id === id));
      edgeEls.forEach((el) => {
        el.classList.toggle("hot", el.dataset.a === id || el.dataset.b === id);
      });
    }
  };
}
