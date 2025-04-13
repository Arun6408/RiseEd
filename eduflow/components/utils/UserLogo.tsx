import { userLogoBgColors } from "@/constants";

const UserLogo = ({ name , className}: { name: string; className:string ; }) => {
    const color = userLogoBgColors[name.length % userLogoBgColors.length];
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2);

  return (
    initials.length > 0 ? (
      <div
      className={`flex items-center justify-center h-12 w-12 rounded-full shadow-md ${className} `}
      style={{ backgroundColor: color || '#FF8C00' }} 
    >
      <span className="text-white text-lg font-semibold tracking-wide uppercase">
        {initials}
      </span>
    </div>
    ) : null
  );
};

export default UserLogo;
