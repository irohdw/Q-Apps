import { IconTypes } from "./IconTypes";

export const BriefcaseSVG: React.FC<IconTypes> = ({
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
      <path d="M140-180v-21.75V-180v-480 480Zm0 60q-24 0-42-18t-18-42v-480q0-24 18-42t42-18h180v-100q0-23 18-41.5t42-18.5h200q24 0 42 18.5t18 41.5v100h180q24 0 42 18t18 42v225q-14-11-28.5-20T820-472v-188H140v480h334q4 16 10 31t14 29H140Zm240-600h200v-100H380v100ZM720-47q-79 0-136-57t-57-136q0-79 57-136t136-57q79 0 136 57t57 136q0 79-57 136T720-47Zm0-79 113-113-21-21-77 77v-171h-30v171l-77-77-21 21 113 113Z" />
    </svg>
  );
};
