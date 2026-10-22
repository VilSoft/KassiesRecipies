"use client"
import React, { useState, useEffect } from "react"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { Input } from "./ui/input";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setAddConversionIsOpen } from "@/redux/features/recipieListSlice";
import { setAddRecipieIsOpen } from "@/redux/features/recipieListSlice";
import { setSearchParam } from "@/redux/features/recipieListSlice";
import { Menu } from "lucide-react";

export default function Navbar() {
    const dispatch = useDispatch<AppDispatch>();
    const [isDarkMode, setIsDarkmode] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        // Theme class is applied pre-hydration by the inline script in app/layout.tsx
        setIsDarkmode(window.document.documentElement.classList.contains("dark"));
    }, [])

    const toggleTheme = () => {
        const root = window.document.documentElement;
        const isDark = root.classList.contains("dark");

        if (isDark) {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkmode(false);
        } else {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkmode(true);
        }
    }

     return (
        <nav className="w-full glass-nav sticky top-0 z-40">
            <div className="flex items-center justify-between max-w-2xl mx-auto px-4 py-3 gap-3">
                <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                            <div className="text-xl brand-title">
                                Kassie&apos;s Recipes
                            </div>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="flex items-center gap-2">
                    <Input type="text" className="w-48 search-input hidden sm:block" placeholder="Search recipes..." onChange={(e) => dispatch(setSearchParam(e.target.value))} />
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {isOpen &&
                <div className="border-t border-[hsl(var(--card-edge))] max-w-2xl mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
                    <Input type="text" className="search-input sm:hidden w-full mb-1" placeholder="Search recipes..." onChange={(e) => dispatch(setSearchParam(e.target.value))} />
                    <div className="flex items-center gap-2 ml-auto">
                        <Button onClick={() => dispatch(setAddRecipieIsOpen(true))} className="btn-primary h-9 text-sm">Add Recipe</Button>
                        <Button onClick={() => dispatch(setAddConversionIsOpen(true))} className="btn-ghost h-9 text-sm">Add Conversion</Button>
                        <Button onClick={toggleTheme} variant="ghost" size="icon" aria-label="Toggle theme">
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            }
        </nav>
    )
}