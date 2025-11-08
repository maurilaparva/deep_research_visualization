import { NodeProps, Handle, Position, useReactFlow } from "reactflow";
import React, { FC, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const CustomNode: FC<NodeProps> = ({ id, sourcePosition, targetPosition, data }) => {
  const { project, setNodes } = useReactFlow()
  const draggingRef = useRef<boolean>(false)
  const startClient = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const p = project({ x: e.clientX, y: e.clientY })
      const dx = p.x - startClient.current.x
      const dy = p.y - startClient.current.y
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, position: { x: startPos.current.x + dx, y: startPos.current.y + dy } } : n)))
    }

    const onPointerUp = () => {
      draggingRef.current = false
      // release pointer capture handled by browser
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [id, project, setNodes])

  const handlePointerDown = (e: React.PointerEvent) => {
    // start dragging
    draggingRef.current = true
    const p = project({ x: e.clientX, y: e.clientY })
    startClient.current = { x: p.x, y: p.y }
    // read current nodes synchronously via setNodes callback to obtain the current position
    let pos = { x: 0, y: 0 }
    setNodes((nds) => {
      const node = nds.find((n) => n.id === id)
      pos = { x: node?.position?.x ?? 0, y: node?.position?.y ?? 0 }
      return nds
    })
    startPos.current = pos
    // prevent underlying interactions
    (e.target as Element).setPointerCapture?.((e as any).pointerId)
  }
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, backgroundColor: data?.bgColor || "transparent" }}
        animate={{ opacity: 1, scale: 1, backgroundColor: data?.bgColor || "transparent" }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
          delay: data?.animationOrder ? data.animationOrder * 0.12 : 0
        }}
        style={{
          overflow: "hidden",
          borderColor: "#d1d5db",       // light gray border
          borderWidth: "1px",
          borderStyle: "solid",
          borderRadius: "5px",
          boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.06)",
          padding: "8px",
          minWidth: "120px",
          minHeight: "34px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          boxSizing: "border-box"
        , cursor: 'grab'
        }}
      >
        <div className="reactflow drag-handle" onPointerDown={handlePointerDown} style={{ fontSize: 12, lineHeight: '1.1em', textAlign: 'center' }}>{data.label}</div>

        <Handle className="nodrag" type="target" position={targetPosition || Position.Top} />
        <Handle className="nodrag" type="source" position={sourcePosition || Position.Bottom} />
      </motion.div>
    </>
  );
};

export default CustomNode;
