"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { recipie } from '@/interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setRecipies, getRecipies } from '@/redux/features/recipieSlice';
import { setConversions, getConversions } from '@/redux/features/conversionSlice';
import {
    getSearchParam,
    getAddConversionIsOpen,
    getAddRecipieIsOpen,
    getIsRecipieOpen,
    setIsRecipieOpen,
    setAddRecipieIsOpen
} from '@/redux/features/recipieListSlice';
import Modal from './Modal';
import AddRecipieForm from './AddRecipieForm'
import ShowRecipie from './ShowRecipie';
import AddConversion from './AddConversion';
import style from '@/styles/List.module.css'
import Image from 'next/image';
import { WhichOpen } from './enums';
import { Plus, UtensilsCrossed } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
    }
}

type LoadStatus = 'loading' | 'ready' | 'error'

async function fetchJson(url: string) {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (res.ok === false) throw new Error(`${url} responded ${res.status}`)
    return res.json()
}

function Recipies() {
    const dispatch = useDispatch<AppDispatch>();
    const recipies = useSelector(getRecipies);
    const conversions = useSelector(getConversions);
    const search = useSelector(getSearchParam);
    const isOpen = useSelector(getAddRecipieIsOpen);
    const isConversionOpen = useSelector(getAddConversionIsOpen);
    const isRecipieOpen = useSelector(getIsRecipieOpen);

    const [status, setStatus] = useState<LoadStatus>('loading');
    const [reloadKey, setReloadKey] = useState<number>(0);
    const [openRecipie, setOpenRecipie] = useState<recipie | null>(null);

    const handleOpenRecipie = (r: recipie) => {
        setOpenRecipie(r);
        dispatch(setIsRecipieOpen(true));
    }

    // Close the view modal if its recipe was deleted
    useEffect(() => {
        if (!openRecipie || status !== 'ready') return;
        if (!recipies.find(r => r._id === openRecipie._id)) {
            dispatch(setIsRecipieOpen(false));
            setOpenRecipie(null);
        }
    }, [recipies, openRecipie, status, dispatch])

    // Get the recipies and conversions from the database
    useEffect(() => {
        let cancelled = false;
        setStatus('loading');

        Promise.all([fetchJson('/api/recipie'), fetchJson('/api/conversion')])
            .then(([recipieData, conversionData]) => {
                if (cancelled) return;
                dispatch(setRecipies(recipieData));
                dispatch(setConversions(conversionData));
                setStatus('ready');
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Failed to load recipes:', err);
                setStatus('error');
            })

        return () => { cancelled = true }
    }, [reloadKey, dispatch])

    const filtered = recipies.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

    const renderList = () => {
        if (status === 'loading') {
            return (
                <div className={style.container} aria-busy="true" aria-label="Loading recipes">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`${style.list} ${style.skeleton}`}>
                            <div className={`${style.image} animate-pulse`} />
                            <div className="h-4 rounded-md bg-muted animate-pulse" style={{ width: `${45 + (i * 13) % 35}%` }} />
                        </div>
                    ))}
                </div>
            )
        }

        if (status === 'error') {
            return (
                <div className={style.container}>
                    <div className={style.emptyState}>
                        <p className={style.emptyTitle}>Couldn&apos;t load recipes</p>
                        <p className={style.emptyText}>The server or database didn&apos;t respond.</p>
                        <button className="btn-ghost mt-4" onClick={() => setReloadKey(k => k + 1)}>Try again</button>
                    </div>
                </div>
            )
        }

        if (recipies.length === 0) {
            return (
                <div className={style.container}>
                    <div className={style.emptyState}>
                        <UtensilsCrossed className="h-8 w-8 text-primary mb-3" />
                        <p className={style.emptyTitle}>No recipes yet</p>
                        <p className={style.emptyText}>Add the first one to get started.</p>
                        <button className="btn-primary mt-4" onClick={() => dispatch(setAddRecipieIsOpen(true))}>Add Recipe</button>
                    </div>
                </div>
            )
        }

        return (
            <motion.div
                className={style.container}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence>
                    {filtered.map((recipie) => (
                        <motion.li
                            key={recipie._id}
                            className={style.list}
                            variants={itemVariants}
                            onClick={() => handleOpenRecipie(recipie)}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.15 }}
                        >
                            {recipie.image
                                ? <Image width={52} height={52} sizes='52px' src={`/api/uploads/${recipie.image}`} alt={recipie.image} className={style.image} />
                                : <div className={`${style.image} ${style.imagePlaceholder}`} aria-hidden="true"><UtensilsCrossed className="h-5 w-5" /></div>}
                            <span className={style.recipeName}>{recipie.name}</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <p className={`${style.emptyText} text-center py-10`}>No recipes match &ldquo;{search}&rdquo;</p>
                )}
            </motion.div>
        )
    }

       return (
            <div className="flex flex-col items-center pt-6 pb-12 min-h-[calc(100vh-57px)]">
                {renderList()}
                {/* Mobile shortcut — on desktop the Add button lives in the navbar menu */}
                <button
                    className="btn-primary sm:hidden fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 h-14 w-14 !p-0 !rounded-full flex items-center justify-center shadow-glow-sm"
                    onClick={() => dispatch(setAddRecipieIsOpen(true))}
                    aria-label="Add recipe"
                >
                    <Plus className="h-6 w-6" />
                </button>
                <Modal title="Add a Recipe" isOpen={isOpen} type={WhichOpen.add}>
                    <AddRecipieForm conversions={conversions} />
                </Modal>
                <Modal title="Add a conversion" isOpen={isConversionOpen} type={WhichOpen.conv}>
                    <AddConversion />
                </Modal>
                {openRecipie && (
                    <Modal title={openRecipie.name} isOpen={isRecipieOpen} type={WhichOpen.show}>
                        <ShowRecipie recipie={openRecipie} conversions={conversions} />
                    </Modal>
                )}
            </div>
        )
}

export default Recipies
