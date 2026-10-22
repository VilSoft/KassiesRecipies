import { connectMongoRecipies } from "@/utils";
import { Conversion } from "@/models";
import { conversionBody, describeIssues } from "@/interfaces/zServer"
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type ConversionBody = z.infer<typeof conversionBody>

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { action, conversion } = data ?? {};

        if (action !== 'add') return badRequest('Unknown action')
        const parsed = conversionBody.safeParse(conversion)
        if (!parsed.success) return badRequest(`Invalid conversion: ${describeIssues(parsed.error)}`)

        return await addConversion(parsed.data);
    } catch (err) {
        console.error('POST /api/conversion failed:', err)
        return NextResponse.json({ error: `Failed to process the request: ${err}` }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectMongoRecipies()
        const conversions = await Conversion.find({}).lean()
        return NextResponse.json(conversions)
    } catch (err) {
        console.error('GET /api/conversion failed:', err)
        return NextResponse.json({ error: `Failed to load conversions: ${err}` }, { status: 500 })
    }
}

// POST: Add
async function addConversion(conversionToAdd: ConversionBody) {
    await connectMongoRecipies()
    const conversion = await Conversion.create(conversionToAdd)
    return NextResponse.json(
        { message: 'Conversion added successfully', data: conversion },
        { status: 201 }
    )
}
