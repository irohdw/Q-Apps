import { IconTypes } from "./IconTypes";

export const OrdersSVG: React.FC<IconTypes> = ({
  color,
  height,
  width,
  className
}) => {
  return (
    <svg
      fill={color}
      height={height}
      width={width}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
    >
      <path d="M180-80q-24 0-42-18t-18-42v-530q0-24 18-42t42-18h110q0-79 53-134.5T475-920q79 0 137 55.575T670-730h110q24 0 42 18t18 42v530q0 24-18 42t-42 18H180Zm0-60h600v-530H180v530Zm300-290q79 0 137-58t58-137h-60q0 55-40 95t-95 40q-55 0-95-40t-40-95h-60q0 79 58 137t137 58ZM350-730h260q0-55-37.5-92.5T480-860q-55 0-92.5 37.5T350-730ZM180-140v-530 530Z" />
    </svg>
  );
};
