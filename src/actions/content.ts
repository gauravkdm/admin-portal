"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

// Categories CRUD
export async function createCategory(data: {
  Name: string
  Description?: string
  Unicode?: string
  Color?: string
}) {
  await db.eventCategories.create({
    data: {
      Name: data.Name,
      Description: data.Description ?? null,
      Unicode: data.Unicode ?? null,
      Color: data.Color ?? null,
    },
  })
  revalidatePath("/", "layout")
}

export async function updateCategory(
  id: number,
  data: {
    Name?: string
    Description?: string
    Unicode?: string
    Color?: string
  }
) {
  await db.eventCategories.update({
    where: { Id: id },
    data: {
      ...(data.Name !== undefined && { Name: data.Name }),
      ...(data.Description !== undefined && { Description: data.Description }),
      ...(data.Unicode !== undefined && { Unicode: data.Unicode }),
      ...(data.Color !== undefined && { Color: data.Color }),
    },
  })
  revalidatePath("/", "layout")
}

export async function deleteCategory(id: number) {
  await db.eventCategories.delete({
    where: { Id: id },
  })
  revalidatePath("/", "layout")
}

// Hobbies CRUD
export async function createHobby(data: { Name?: string; Unicode?: string }) {
  await db.hobbies.create({
    data: {
      Name: data.Name ?? null,
      Unicode: data.Unicode ?? null,
    },
  })
  revalidatePath("/", "layout")
}

export async function updateHobby(
  id: number,
  data: { Name?: string; Unicode?: string }
) {
  await db.hobbies.update({
    where: { Id: id },
    data: {
      ...(data.Name !== undefined && { Name: data.Name }),
      ...(data.Unicode !== undefined && { Unicode: data.Unicode }),
    },
  })
  revalidatePath("/", "layout")
}

export async function deleteHobby(id: number) {
  await db.hobbies.delete({
    where: { Id: id },
  })
  revalidatePath("/", "layout")
}

// Interests CRUD
export async function createInterest(data: {
  Name?: string
  Unicode?: string
}) {
  await db.interests.create({
    data: {
      Name: data.Name ?? null,
      Unicode: data.Unicode ?? null,
    },
  })
  revalidatePath("/", "layout")
}

export async function updateInterest(
  id: number,
  data: { Name?: string; Unicode?: string }
) {
  await db.interests.update({
    where: { Id: id },
    data: {
      ...(data.Name !== undefined && { Name: data.Name }),
      ...(data.Unicode !== undefined && { Unicode: data.Unicode }),
    },
  })
  revalidatePath("/", "layout")
}

export async function deleteInterest(id: number) {
  await db.interests.delete({
    where: { Id: id },
  })
  revalidatePath("/", "layout")
}

// Languages CRUD
export async function createLanguage(data: { Name?: string; Code?: string }) {
  await db.languages.create({
    data: {
      Name: data.Name ?? null,
      Code: data.Code ?? null,
    },
  })
  revalidatePath("/", "layout")
}

export async function updateLanguage(
  id: number,
  data: { Name?: string; Code?: string }
) {
  await db.languages.update({
    where: { Id: id },
    data: {
      ...(data.Name !== undefined && { Name: data.Name }),
      ...(data.Code !== undefined && { Code: data.Code }),
    },
  })
  revalidatePath("/", "layout")
}

export async function deleteLanguage(id: number) {
  await db.languages.delete({
    where: { Id: id },
  })
  revalidatePath("/", "layout")
}

// Questions CRUD
export async function createQuestion(data: {
  QuestionText?: string
  Category?: string
  IsActive: boolean
  DisplayOrder: number
}) {
  await db.questions.create({
    data: {
      QuestionText: data.QuestionText ?? null,
      Category: data.Category ?? null,
      IsActive: data.IsActive,
      DisplayOrder: data.DisplayOrder,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  })
  revalidatePath("/", "layout")
}

export async function updateQuestion(
  id: number,
  data: {
    QuestionText?: string
    Category?: string
    IsActive?: boolean
    DisplayOrder?: number
  }
) {
  await db.questions.update({
    where: { Id: id },
    data: {
      ...(data.QuestionText !== undefined && {
        QuestionText: data.QuestionText,
      }),
      ...(data.Category !== undefined && { Category: data.Category }),
      ...(data.IsActive !== undefined && { IsActive: data.IsActive }),
      ...(data.DisplayOrder !== undefined && {
        DisplayOrder: data.DisplayOrder,
      }),
    },
  })
  revalidatePath("/", "layout")
}

export async function deleteQuestion(id: number) {
  await db.questions.delete({
    where: { Id: id },
  })
  revalidatePath("/", "layout")
}
