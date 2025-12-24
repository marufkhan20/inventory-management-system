"use client";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { SignupData, signupSchema } from "@/validation/signupSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignupData) => {
    try {
      await authClient.signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: async () => {
            toast.success("Signup successfull.");
            router.push("/");
          },
          onError: async (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.log("error", error);
      throw new Error("Something went wrong");
    }
  };
  return (
    <div className="bg-white shadow-2xl py-10 px-8 rounded-3xl text-center flex flex-col items-center gap-4 w-100">
      <div className="mt-4">
        <Logo />
      </div>
      <h3 className="text-base text-black">Create a new account</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Input
          {...register("name")}
          placeholder="Enter your bar name"
          type="text"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-left text-red-500 font-medium">
            {errors.name.message}
          </p>
        )}
        <Input
          {...register("email")}
          placeholder="you@example.com"
          type="text"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-left text-red-500 font-medium">
            {errors.email.message}
          </p>
        )}
        <Input
          {...register("password")}
          placeholder="Enter password"
          type="password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-left text-red-500 font-medium">
            {errors.password.message}
          </p>
        )}
        <Button
          disabled={isSubmitting}
          type="submit"
          className="flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} Sign up
        </Button>
      </form>
      <p className="text-sm text-[#6B7280]">
        Already have an account?{" "}
        <Link href="/login" className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Page;
