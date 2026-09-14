import { useAuthStore } from "@/store/Auth";
import React, { use } from "react";

function RegisterPage() {

    const {createAccount, login} = useAuthStore();
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // collect data
        const formData = new FormData(e.currentTarget)
        const firstname = formData.get("firstname")
        const lasttname = formData.get("lastname")
        const email = formData.get("email")
        const password = formData.get("password")

        // validate
        if(!firstname || !lasttname || !email || !password) {
            setError(() => "Please fill out the field.")

            return
        }
        // call the store
        setIsLoading(true)
        setError("")

        const response = await createAccount(
            `${firstname} ${lasttname}`, email?.toString(),
            password?.toString()

        )

        if(response.error) {
            setError(() => response.error!.message)
        } else {
            const loginResponse = await login(email.toString(), password.toString())

            if(loginResponse.error) {
                setError(() => loginResponse.error!.message)
            }
        }

        setIsLoading(() => false)
    }
    return (
        <div>RegisterPage</div>
    )
}

export default RegisterPage