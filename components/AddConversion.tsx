import React, { useState } from 'react'
import { useForm, FieldErrors } from 'react-hook-form'
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select" 
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchema } from '@/interfaces/zConverter'
import { Units } from './enums'
import { addConversion } from '@/redux/features/conversionSlice'
import { Input } from '@/components/ui/input'
import { ArrowBigDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { conversion } from '@/interfaces';
import { setAddConversionIsOpen } from '@/redux/features/recipieListSlice';
import { useToast } from './Toast';

// const errMsgs: string[] = ["An error has occured on the server", "Too many errors occuring, try again later"]

function AddConversion() {
    const dispatch = useDispatch<AppDispatch>();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            unit: Units.cup,
            toGrams: 0,
            isGrams: 0
        }
    })

    const [error, setError] = useState<number>(0);
    const toast = useToast();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (values.toGrams != 1) {
            values.isGrams /= values.toGrams;
            values.toGrams /= values.toGrams;
        }

        const conversion: conversion = {
            _id: "",
            name: values.name.toLowerCase(),
            toGrams: values.isGrams,
            unit: values.unit
        }
        // Send to database
        await fetch('/api/conversion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: 'add', conversion})
        }).then(async (res) => {
            // Error handling and closing dialog
            if (res.ok) {
                const data = await res.json();
                dispatch(addConversion(data.data));
                dispatch(setAddConversionIsOpen(false));
                toast(`Added conversion for ${conversion.name}`);
            } else {
                throw new Error(`Add conversion responded ${res.status}`);
            }
        }).catch(() => {
            toast("Couldn't save the conversion.", 'error');
            setError(error + 1);
            if (error >= 2) {
                setTimeout(() => {
                    dispatch(setAddConversionIsOpen(false));
                }, 1000)
            }
        })
    }

    const onError = (errors: FieldErrors<z.infer<typeof formSchema>>) => {
        console.log("Validation errors: ", errors)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <FormField 
                    control={form.control}
                    name="name"
                    render={({}) => (
                        <FormItem>
                            <FormLabel>Ingredient</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...form.register(`name` as const)} />
                            </FormControl>
                            {form.formState.errors.name && (
                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </FormItem>
                    )}
                />
                <div className="flex items-center space-x-4">
                    <FormField 
                        control={form.control}
                        name="toGrams"
                        render={({}) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" {...form.register(`toGrams`, { valueAsNumber: true })} />
                                </FormControl>
                                {form.formState.errors.toGrams && (
                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.toGrams.message}</p>
                                )}
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="unit"
                        render={({}) => (
                            <FormItem>
                                <FormControl>
                                    <label>Unit
                                        <Select 
                                            {...form.register(`unit`)}
                                            defaultValue={Units.cup}
                                            onValueChange={(e) => {
                                                const u = e as keyof typeof Units
                                                form.setValue(`unit`, Units[u])
                                            }}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={Units.cup} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(Units).map((type, index) => (
                                                    <SelectItem value={type} key={index}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </label>
                                </FormControl>
                                {form.formState.errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </FormItem>
                        )}
                    />
                </div><br />
                <div className="flex justify-center">
                    <ArrowBigDown className="h-10 w-10"/>
                </div>
                <div className="flex items-center space-x-4">
                    <FormField 
                        control={form.control}
                        name="isGrams"
                        render={({}) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" {...form.register(`isGrams`, { valueAsNumber: true })} />
                                </FormControl>
                                {form.formState.errors.isGrams && (
                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.isGrams.message}</p>
                                )}
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="unit"
                        render={({}) => (
                            <FormItem>
                                <FormControl>
                                    <label>Unit
                                        <Select 
                                            {...form.register(`unit`)}
                                            defaultValue={Units.g}
                                            disabled={true}
                                            onValueChange={(e) => {
                                                const u = e as keyof typeof Units
                                                form.setValue(`unit`, Units[u])
                                            }}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={Units.g} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(Units).map((type, index) => (
                                                    <SelectItem value={type} key={index}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </label>
                                </FormControl>
                                {form.formState.errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </FormItem>
                        )}
                    />
                </div>
                <br />
                <div className="flex justify-end items-center space-x-4">
                    <Button type="button" variant="secondary" onPointerDown={(e) => e.preventDefault()} onClick={() => dispatch(setAddConversionIsOpen(false))}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    )
}

export default AddConversion