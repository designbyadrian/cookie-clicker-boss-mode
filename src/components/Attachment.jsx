import { Rnd } from "react-rnd";
import { useState } from "react";
import cx from "clsx/lite";

const Attachment = ({
  children,
  id,
  caption,
  onChange,
  onResize,
  onClick,
  lockAspectRatio,
  selected,
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
      as="figure"
      className={cx(
        "relative bg-white border shadow border-slate-200",
        selected && "z-20",
        !selected && "z-10",
      )}
      position={{ x: state.x, y: state.y }}
      size={{ width: state.width, height: state.height }}
      onDragStop={handleDragStop}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      lockAspectRatio={lockAspectRatio}
      onClick={() => onClick?.(id)}
    >
      {selected && (
        <>
          <div className="absolute -top-1 -left-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nwse-resize" />
          <div className="absolute -top-1 -right-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nesw-resize" />
          <div className="absolute -bottom-1 -left-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nesw-resize" />
          <div className="absolute -right-1 -bottom-1 z-10 bg-white border size-2 border-slate-400 aspect-square cursor-nwse-resize" />
        </>
      )}
      <div className="absolute inset-0 overflow-hidden [&>*]:!size-full">
        {children}
      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 top-full p-1 text-sm text-center text-slate-500">
          {caption}
        </figcaption>
      )}
    </Rnd>
  );
};

export default Attachment;
