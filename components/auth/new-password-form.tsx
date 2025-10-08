"use client"

import { CardWrapper } from "./card-wrapper"
import { z } from "zod"
import {useForm} from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { NewPasswordSchema } from "@/schemas"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "../ui/button"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { newPassword } from "@/actions/new-password"
import { useState, useTransition } from "react"

export const NewPasswordForm = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");


        startTransition(() => {
            console.log("values",values)
            newPassword(values , token)
            .then((data) => {
                if (data) {
                    setError(data.error ?? "")
                    setSuccess(data?.success)
                } else {
                    setError("An unexpected error occurred.")
                }
            })
            .catch(() => {
                setError("An error occurred while logging in.")
            })
        })
    };

    return (
        <CardWrapper
            headerLabel="Enter your new password"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form 
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field}
                                        disabled={isPending}
                                        type="password"
                                        placeholder="******"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    >
                    </FormField>
                   
                </div>
                <FormError message={error}/>
                <FormSuccess message={success}/>
                <Button disabled={isPending} variant="default" size="lg" className="w-full" type="submit">Reset password</Button>
                </form> 
            </Form>
        </CardWrapper>
    )
}