// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

(window as any).Draw.loadPlugin(function (ui: any) {
  console.log("🔌 Plugin React carregado dentro do draw.io", ui);

  const graph = ui.editor.graph;
  const model = graph.model;

  const sidebar = document.createElement("div");
  sidebar.id = "react-sidebar";
  sidebar.style.position = "absolute";

  // Posição salva ou padrão
  const savedTop = localStorage.getItem("react-sidebar-top") || "0px";
  const savedRigth = localStorage.getItem("react-sidebar-rigth") || "0px";
  sidebar.style.top = savedTop;
  sidebar.style.right = savedRigth;

  sidebar.style.width = "400px";
  sidebar.style.height = "100%";
  sidebar.style.background = "#fff";
  sidebar.style.zIndex = "9999";
  sidebar.style.border = "1px solid #ccc";
  sidebar.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  sidebar.style.borderRadius = "6px";
  sidebar.style.overflow = "hidden";

  // Handle de arraste
  const dragHeader = document.createElement("div");
  dragHeader.style.height = "30px";
  dragHeader.style.background = "#eee";
  dragHeader.style.borderBottom = "1px solid #ccc";
  dragHeader.style.cursor = "grab";
  dragHeader.style.display = "flex";
  dragHeader.style.alignItems = "center";
  dragHeader.style.paddingLeft = "10px";
  dragHeader.textContent = "🔧 React Plugin";
  sidebar.appendChild(dragHeader);

  document.body.appendChild(sidebar);

  const root = ReactDOM.createRoot(sidebar);
  root.render(React.createElement(App));

  // Drag logic
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  dragHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - sidebar.offsetLeft;
    offsetY = e.clientY - sidebar.offsetTop;
    dragHeader.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const newRigth = e.clientX - offsetX;
      const newTop = e.clientY - offsetY;
      sidebar.style.rigth = newRigth + "px";
      sidebar.style.top = newTop + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      localStorage.setItem("react-sidebar-top", sidebar.style.top);
      localStorage.setItem("react-sidebar-right", sidebar.style.right);
    }
    isDragging = false;
    dragHeader.style.cursor = "grab";
  });

  const codec = new mxCodec();
  model.addListener(mxEvent.CHANGE, () => {
    const xmlNode = codec.encode(model);
    const xmlString = mxUtils.getXml(xmlNode);

    console.log("📤 XML enviado para React");
    window.postMessage({ type: "drawio-xml-update", payload: xmlString }, "*");
  });

  window.addEventListener("message", (event) => {
    const { type, payload } = event.data || {};
    if (type === "react-xml-update" && typeof payload === "string") {
      try {
        const newDoc = mxUtils.parseXml(payload);
        const newCodec = new mxCodec(newDoc);
        const newModel = newCodec.decode(newDoc.documentElement);

        model.beginUpdate();
        try {
          model.clear();
          model.mergeChildren(newModel.root, model.root);
        } finally {
          model.endUpdate();
        }
        console.log("🔄 XML atualizado via React");
      } catch (err) {
        console.error("❌ Erro ao importar XML do React:", err);
      }
    }
  });
});
