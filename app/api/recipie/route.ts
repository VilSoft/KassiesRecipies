import { connectMongoRecipies } from "@/utils";
import { Recipie } from "@/models";
import { recipieBody, describeIssues } from "@/interfaces/zServer"
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { writeFile } from "fs/promises";
import { z } from "zod";
import { imagePath, removeImageIfUnused } from "@/utils/uploads";

type RecipieBody = z.infer<typeof recipieBody>

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })
const notFound = () => NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') ?? ''

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const action = formData.get('action')
            const recipieRaw = formData.get('recipie')
            const file = formData.get('image')
            const oldImage = formData.get('oldImageLocaltion')

            if (action !== 'add' && action !== 'modify') return badRequest('Unknown action')
            if (typeof recipieRaw !== 'string' || !recipieRaw) return badRequest('Missing recipie data')

            let json: unknown
            try {
                json = JSON.parse(recipieRaw)
            } catch {
                return badRequest('Recipie data is not valid JSON')
            }
            const parsed = recipieBody.safeParse(json)
            if (!parsed.success) return badRequest(`Invalid recipie: ${describeIssues(parsed.error)}`)
            const recipie = parsed.data

            if (action === 'modify' && !isValidObjectId(recipie._id)) return badRequest('Missing or invalid recipie id')

            // Only touch the disk once the request is known to be valid
            const hasUpload = !!file && typeof file !== 'string' && file.size > 0 && !!recipie.image
            if (hasUpload) {
                await writeFile(imagePath(recipie.image), Buffer.from(await file.arrayBuffer()))
            }

            if (action === 'add') return await addRecipie(recipie)
            return await modifyRecipie(recipie, hasUpload && typeof oldImage === 'string' ? oldImage : '')
        }

        const data = await req.json()
        if (data?.action !== 'delete') return badRequest('Unknown action')
        if (!isValidObjectId(data.id)) return badRequest('Missing or invalid id')
        return await deleteRecipie(data.id)
    } catch (err) {
        console.error('POST /api/recipie failed:', err)
        return NextResponse.json({ error: `Failed to process the request: ${err}` }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectMongoRecipies()
        // lean() returns documents exactly as stored, independent of schema changes
        const recipies = await Recipie.find({}).lean()
        return NextResponse.json(recipies)
    } catch (err) {
        console.error('GET /api/recipie failed:', err)
        return NextResponse.json({ error: `Failed to load recipes: ${err}` }, { status: 500 })
    }
}

// POST: Add
async function addRecipie(recipieToAdd: RecipieBody) {
    await connectMongoRecipies()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...fields } = recipieToAdd
    const recipie = await Recipie.create(fields)
    return NextResponse.json(
        { message: 'Recipie added successfully', data: recipie },
        { status: 201 }
    )
}

// POST: Modify
async function modifyRecipie(modRecipie: RecipieBody, replacedImage: string) {
    await connectMongoRecipies()
    const { _id, ...fields } = modRecipie
    const recipie = await Recipie.findByIdAndUpdate(_id, fields, { new: true, runValidators: true })
    if (!recipie) return notFound()

    if (replacedImage && replacedImage !== recipie.image) {
        await removeImageIfUnused(replacedImage)
    }
    return NextResponse.json({ message: 'Recipie modified successfully', data: recipie })
}

// POST: Delete
async function deleteRecipie(recipieId: string) {
    await connectMongoRecipies()
    const recipie = await Recipie.findByIdAndDelete(recipieId)
    if (!recipie) return notFound()

    await removeImageIfUnused(recipie.image)
    return NextResponse.json({ message: 'Recipe deleted successfully', data: recipie })
}
