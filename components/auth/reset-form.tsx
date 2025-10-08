"use client"

import { CardWrapper } from "./card-wrapper"
import { z } from "zod"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResetSchema } from "@/schemas"
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
import { reset } from "@/actions/reset"
import { useState, useTransition } from "react"

export const ResetForm = () => {
    const [error, setError] = useState("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        },
    })

    // const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    //     setError("");
    //     setSuccess("");

    //     startTransition(() => {
    //         login(values) 
    //         .then((data) => {
    //             setError(data.error)
    //             setSuccess(data.success)
    //         })
    //     })
    // };

    const onSubmit = async (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");


        startTransition(() => {
            console.log("values",values)
            reset(values)
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
            headerLabel="Forgot your password?"
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
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field}
                                        disabled={isPending}
                                        type="email"
                                        placeholder="jhon.doe@example.com"
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
                <Button disabled={isPending} variant="default" size="lg" className="w-full" type="submit">Send reset email</Button>
                </form> 
            </Form>
        </CardWrapper>
    )
}