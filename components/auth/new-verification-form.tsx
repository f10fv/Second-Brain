"use client"

import { CardWrapper } from "./card-wrapper"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { BeatLoader} from "react-spinners"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { newVerification } from "@/actions/new-verification"

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const onSubmit = useCallback(() => {
        if( success || error ) {
            return
        }
        if(!token) {
            setError("Missing token!")
            return
        }
        newVerification(token)
        .then((data) => {
            setSuccess(data.success)
            setError(data.error)
        })
        .catch(() => {
            setError("Something went wrong. Please try again later.")
        })
    }, [token, success, error])

    useEffect(() => {
        onSubmit()
    },[onSubmit])
    
    return( 
    <CardWrapper
     headerLabel="Confirm your verification email"
     backButtonLabel="Back to login"
     backButtonHref="/auth/login"
    >
        <div className="w-full flex justify-center items-center">
            {!success && !error && (
                <BeatLoader />
            )}
            <FormSuccess message={success} />
            {!success && (
                <FormError message={error} />
            )}
        </div>
    </CardWrapper>
)}
