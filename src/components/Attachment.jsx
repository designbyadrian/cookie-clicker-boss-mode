import { Rnd } from "react-rnd";
import { useState } from "react";

const Attachment = ({
  children,
  id,
  onChange,
  onResize,
  lockAspectRatio,
  ...props
}) => {
  const [state, setState] = useState({
    x: props.x ?? 0,
    y: props.y ?? 0,
    width: props.width ?? 300,
    height: props.height ?? 300,
  });

  const handleDragStop = (e, d) => {
    setState({ ...state, x: d.x, y: d.y });
    onChange?.(id, state);
  };

  const handleResize = (e, corner, element, size, position) => {
    onResize?.(id, size);
  };

  const handleResizeStop = (e, d, ref, delta, position) => {
    setState({
      ...position,
      width: ref.style.width,
      height: ref.style.height,
    });
    onChange?.(id, state);
  };

  return (
    <Rnd
      className="relative bg-white border shadow border-slate-200"
      position={{ x: state.x, y: state.y }}
      size={{ width: state.width, height: state.height }}
      onDragStop={handleDragStop}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      lockAspectRatio={lockAspectRatio}
    >
      <div className="absolute -top-1 -left-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nwse-resize" />
      <div className="absolute -top-1 -right-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nesw-resize" />
      <div className="absolute -bottom-1 -left-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nesw-resize" />
      <div className="absolute -right-1 -bottom-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nwse-resize" />
      <div className="relative">{children}</div>
    </Rnd>
  );
};

export default Attachment;
