const UserLogo = ({ name, color }: { name: string; color: string }) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className="flex items-center justify-center h-12 w-12 rounded-full shadow-md"
      style={{ backgroundColor: color || '#FF8C00' }} 
    >
      <span className="text-white text-lg font-semibold tracking-wide uppercase">
        {initials}
      </span>
    </div>
  );
};

export default UserLogo;
