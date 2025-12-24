const AuthLoader = () => {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Animated Rings */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/20" />

        {/* Center Icon or Logo */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40">
          {/* Replace with your actual Logo/Icon */}
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <h3 className="text-sm font-semibold text-main tracking-tight">
          Securing your session
        </h3>
        <p className="text-xs text-secondary animate-pulse">
          Verifying credentials...
        </p>
      </div>
    </div>
  );
};

export default AuthLoader;
