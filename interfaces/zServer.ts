import { z } from "zod"

// Server-side validation of what the API stores. Mirrors the stored document
// shape (instructions are plain strings) and is looser than the form schemas
// so recipes saved before the form rules tightened can still be edited.

const notBlank = (s: string) => s.trim().length > 0

const ingredientBody = z.object({
    name: z.string().refine(notBlank, "Ingredient name is required"),
    value: z.number().finite().nonnegative(),
    type: z.string().min(1),
    convAvailable: z.boolean().optional()
})

const recipieBody = z.object({
    _id: z.string().optional(),
    name: z.string().refine(notBlank, "Name is required"),
    ingredients: z.array(ingredientBody),
    instructions: z.array(z.string()),
    image: z.string().default(""),
    servings: z.number().finite().nonnegative(),
    cals: z.number().finite().nonnegative()
})

const conversionBody = z.object({
    name: z.string().refine(notBlank, "Name is required"),
    unit: z.string().min(1),
    toGrams: z.number().finite().positive()
})

const describeIssues = (error: z.ZodError) =>
    error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ')

export {
    recipieBody,
    conversionBody,
    describeIssues
}
