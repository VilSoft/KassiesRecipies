"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { conversion, ingredient, recipie } from '@/interfaces'
import style from '@/styles/RecipieForm.module.css'
import { modifyRecipie } from '@/redux/features/recipieSlice'
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { formSchema, instructions } from '@/interfaces/zRecipies'
import { Units } from '@/components/enums'
import { useForm, FieldErrors, useFieldArray } from 'react-hook-form'
import { Button } from "@/components/ui/button"
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
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import toGrams from './Converter'
import { useToast } from './Toast'

interface AddProps {
    setModMode: React.Dispatch<React.SetStateAction<boolean>>,
    setRecipie: React.Dispatch<React.SetStateAction<recipie>>,
    recipie: recipie,
    conversions: Array<conversion>
}

const errMsgs: string[] = ["An error has occured on the server", "Too many errors occuring, try again later"]

const rowVariants = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 8, transition: { duration: 0.15 } }
}

function AddRecipieForm({ conversions, setModMode, recipie, setRecipie } : AddProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = useState<number>(0);
    const [forceRefresh, setForceRefresh] = useState<boolean>(false);
    const [image, setImage] = useState<File | null>(null);
    const toast = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: recipie.name,
            ingredients: recipie.ingredients.map((i) => {return { name: i.name, value: i.value, type: Units[i.type as Units], convAvailable: false }}),
            instructions: recipie.instructions.map((i) => {return { value: i }}),
            image: "",
            servings: recipie.servings,
            cals: recipie.cals
        }
    })
    const control = form.control;

    // Set up watchers
    const { fields: ingredientFields } = useFieldArray({
        control,
        name: "ingredients"
    });
    const { fields: instructionFields } = useFieldArray({
        control,
        name: "instructions"
    });

    // Array controls
    const addIngredient = () => {
        const currentIngredients = form.getValues("ingredients") || [];
        const newIngredient = { name: "", value: 0, type: Units.g, convAvailable: false }
        form.setValue("ingredients", [...currentIngredients, newIngredient])
    }
    const removeIngredient = (index: number) => {
        const currentIngredients = form.getValues("ingredients");
        const updatedIngredients = currentIngredients.filter((_, i) => i !== index);
        form.setValue("ingredients", updatedIngredients);
    }
    const addInstruction = () => {
        const currentInstructions = form.getValues("instructions") || [];
        const newInstructions = {value: ""}
        form.setValue("instructions", [...currentInstructions, newInstructions])

        // Make sure none of the textareas gets resized
        setTimeout(() => {
            document.querySelectorAll("textarea").forEach((textarea) => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            })
        })
    }
    const removeInstruction = (index: number) => {
        const currentInstructions = form.getValues("instructions");
        const updatedInstructions = currentInstructions.filter((_, i) => i !== index);
        form.setValue("instructions", updatedInstructions);
    }

    // Automatically change textarea height
    const handleInstrInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

        const textarea = e.target as HTMLTextAreaElement;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }

    const handlePossibleConv = (index: number, unit: Units) => {
        const ing = form.getValues(`ingredients.${index}`);
        
        const found = conversions.find(obj => obj.name === ing.name && obj.unit == unit)
        if (found) {
            form.setValue(`ingredients.${index}.convAvailable`, true);
        } else {
            form.setValue(`ingredients.${index}.convAvailable`, false);
        }
        setForceRefresh(!forceRefresh);
    }

    const handleConvert = (index: number) => {
        const ing: ingredient = form.getValues(`ingredients.${index}`);
        const found = conversions.find(obj => obj.name === ing.name && obj.unit == ing.type)

        if (found && ing.value > 0) {
            const newIng: number = toGrams(ing, found);
            form.setValue(`ingredients.${index}.value`, newIng);
            form.setValue(`ingredients.${index}.type`, Units.g);
            form.setValue(`ingredients.${index}.convAvailable`, false);
        }
        setForceRefresh(!forceRefresh);
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Convert from zod recipie object to recipie interface
        const instructs: string[] = values.instructions.map((ins: z.infer<typeof instructions>) => ins.value);
        const modRecipie: recipie = {
            _id: recipie._id,
            name: values.name,
            ingredients: values.ingredients,
            instructions: instructs,
            image: recipie.image,
            servings: values.servings,
            cals: values.cals
        }
        const formData = new FormData();
        formData.append('action', 'modify');
        if (image instanceof File) {
            formData.append("image", image);
            const now: Date = new Date()
            const dateAsString = `${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
            modRecipie.image = modRecipie.name.replace(' ', '_') + '-' + dateAsString + image.name.slice(image.name.indexOf('.'));
        }
        formData.append("recipie", JSON.stringify(modRecipie));
        formData.append("oldImageLocaltion", recipie.image);

        // Send to database
        await fetch('/api/recipie', {
            method: 'POST',
            body: formData
        }).then(async (res) => {
            // Error handling and closing dialog
            if (res.ok) {
                const data = await res.json();
                dispatch(modifyRecipie(data.data));
                setRecipie(data.data);
                setModMode(false);
                toast('Changes saved');
            } else {
                throw new Error(`Modify responded ${res.status}`);
            }
        }).catch(() => {
            toast("Couldn't save your changes.", 'error');
            setError(error + 1);
            if (error >= 2) {
                setTimeout(() => {
                    setModMode(false);
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Da Yummy's Name</FormLabel>
                            <FormControl>
                                <Input placeholder={""} {...field} />
                            </FormControl>
                            {form.formState.errors.name && (
                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </FormItem>
                    )}
                /><br />
                <div className="flex items-center space-x-4">
                    <FormField 
                        control={form.control}
                        name="servings"
                        render={({}) => (
                            <label>Servings
                                <Input type="number" {...form.register(`servings`, { valueAsNumber: true })} />
                            </label>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="cals"
                        render={({}) => (
                            <label>Calories
                                <Input type="number" {...form.register(`cals`, { valueAsNumber: true })} />
                            </label>
                        )}
                    />
                </div><br />
                <FormField 
                    control={form.control}
                    name="ingredients"
                    render={({}) => (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium">Ingredients</h3>
                                <Button type="button" onClick={addIngredient} className="ml-4">Add</Button>
                            </div>
                            <AnimatePresence mode="popLayout">
                            {ingredientFields.map((field, i) => (
                                <motion.div key={field.id} className={style.ingredient} variants={rowVariants} initial="hidden" animate="show" exit="exit">
                                    <Button type="button" onClick={() => removeIngredient(i)} className={style.remove}>-</Button>
                                    <div className={style.spec}>
                                        <FormItem>
                                            <FormControl>
                                                <label>Name
                                                    <Input {...form.register(`ingredients.${i}.name` as const, {
                                                        onChange: (e) => {
                                                            form.setValue(`ingredients.${i}.name`, e.target.value.toLowerCase())
                                                        }
                                                    })} />
                                                </label>
                                            </FormControl>
                                            {form.formState.errors.ingredients?.[i]?.name && (
                                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.ingredients?.[i]?.name.message}</p>
                                            )}
                                        </FormItem>
                                        <div className="flex items-center space-x-4">
                                            <FormItem>
                                                <FormControl>
                                                    <label>Amount
                                                        <Input type="number" {...form.register(`ingredients.${i}.value`, { valueAsNumber: true })} step="any" />
                                                    </label>
                                                </FormControl>
                                                {form.formState.errors.ingredients?.[i]?.value && (
                                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.ingredients?.[i]?.value.message}</p>
                                                )}
                                            </FormItem>
                                            <FormItem>
                                                <FormControl>
                                                    <label>Unit
                                                        <Select 
                                                            {...form.register(`ingredients.${i}.type`)}
                                                            defaultValue={form.getValues(`ingredients.${i}.type`)}
                                                            onValueChange={(e) => {
                                                                const u = e as keyof typeof Units
                                                                handlePossibleConv(i, Units[u])
                                                                form.setValue(`ingredients.${i}.type`, Units[u])
                                                            }}
                                                            value={form.getValues(`ingredients.${i}.type`)}
                                                        >
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder={form.getValues(`ingredients.${i}.type`)} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(Units).map((type, index) => (
                                                                    <SelectItem value={type} key={index}>{type}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </label>
                                                </FormControl>
                                                {form.formState.errors.ingredients?.[i]?.value && (
                                                    <p className="mt-1 text-sm text-transparent">{form.formState.errors.ingredients?.[i]?.value.message}</p>
                                                )}
                                            </FormItem>
                                        </div>
                                        {form.getValues(`ingredients.${i}.convAvailable`) &&
                                            <Button type="button" variant="outline" onClick={() => handleConvert(i)}>Conver to Grams</Button>
                                        }
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                            {ingredientFields.length >= 2 ?
                                <Button type="button" onClick={addIngredient} className="w-full">Add Ingredient</Button> : <></>
                            }
                        </div>
                    )}
                /><br />
                <FormField 
                    control={form.control}
                    name="instructions"
                    render={({}) => (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium">Instructions</h3>
                                <Button type="button" onClick={addInstruction} className="ml-4">Add</Button>
                            </div>
                            <AnimatePresence mode="popLayout">
                            {instructionFields.map((field, i) => (
                                <motion.div key={field.id} className={style.instruction} variants={rowVariants} initial="hidden" animate="show" exit="exit">
                                    <Button type="button" onClick={() => removeInstruction(i)} className={style.remove}>-</Button>
                                    <FormItem >
                                        <FormControl>
                                            <label className={style.label}>{i + 1}:
                                                <textarea 
                                                    {...form.register(`instructions.${i}.value` as const)}
                                                    className="block w-full !resize-none overflow-hidden rounded-md border border-input p-2 focus:outline-none focus:ring-2 focus:ring-ring bg-transparent "
                                                    rows={1}
                                                    onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInstrInput(e)}
                                                    placeholder=''
                                                    value={form.watch(`instructions.${i}.value`)}
                                                />
                                            </label>
                                        </FormControl>
                                        {form.formState.errors.instructions?.[i]?.value && (
                                            <p className="mt-1 text-sm text-red-500">{form.formState.errors.instructions?.[i]?.value.message}</p>
                                        )}
                                    </FormItem>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                            {instructionFields.length >= 2 ?
                                <Button type="button" onClick={addInstruction} className="w-full">Add Instruction</Button> : <></>
                            }
                        </div>
                    )}
                /><br />
                <FormField 
                    control={form.control}
                    name="image"
                    render={({}) => (
                        <FormItem>
                            <label htmlFor='image'>Choose an image: {recipie.image !== "" ? "*you already have an image for this recipie, this will replace the current image" : ""}</label>
                            <Input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
                        </FormItem>
                    )}
                />
                {error > 0 && 
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{ error < 2 ? errMsgs[0] : errMsgs[1] }</AlertDescription>
                    </Alert>
                }
                <br />
                <div className="flex justify-end items-center space-x-4">
                    <Button type="button" variant="secondary" className="form-cancel-btn" onClick={() => setModMode(false)}>Cancel</Button>
                     <Button type="submit" className="form-submit-btn">Submit</Button>
                </div>
            </form>
        </Form>
    )
}

export default AddRecipieForm
