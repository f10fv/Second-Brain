import { db } from "@/lib/db";

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const vervificationToken = await db.verificationToken.findUnique({
            where: { token }
        });

        return vervificationToken
    } catch (error) {
        return null
    }
}

export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const vervificationToken = await db.verificationToken.findFirst({
            where: { email }
        });

        return vervificationToken
    } catch (error) {
        return null
    }
}