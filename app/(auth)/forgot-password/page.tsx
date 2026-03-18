'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/profile`,
    })
    
    setIsLoading(false)
    if (!error) {
      setIsSubmitted(true)
    } else {
      form.setError('root', { message: error.message })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-slate-200/60 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white mb-2">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-center border border-emerald-100">
              <p className="text-sm font-medium text-emerald-800">
                Check your email for a password reset link.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@agency.com" 
                          className="h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button 
                  type="submit" 
                  className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Link...' : 'Send reset link'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
          <Link href="/login" className="text-sm font-medium text-emerald-600 hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
