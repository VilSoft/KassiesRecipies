import { recipie } from '@/interfaces'
import React, { useState } from 'react'
import style from '@/styles/Recipie.module.css'
import Image from 'next/image'
import { PencilLine, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from './ui/select'
import ModifyRecipieForm from './ModifyRecipieForm'
import { conversion } from '@/interfaces'
import { useAppDispatch } from '@/redux/store'
import { deleteRecipie } from '@/redux/features/recipieSlice'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { useToast } from './Toast'

interface RecipieProp {
    recipie: recipie,
    conversions: Array<conversion>
}

const multipliers: Array<number> = [.25, .33, .5, 1, 2, 3, 4, 5, 6]

function ShowRecipie({ recipie, conversions }: RecipieProp) {
  const dispatch = useAppDispatch()

  const [ingMultiplier, setMultiplier] = useState<number>(1);
  const [modMode, setModMode] = useState<boolean>(false);
  const [recipieHere, setRecipie] = useState<recipie>(recipie);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const toast = useToast();

  const handleModify = () => {
    setModMode(true);
  }

  const handleDelete = () => {
    setShowDeleteDialog(true);
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/recipie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: recipieHere._id })
      })
      if (!res.ok) throw new Error(`Delete responded ${res.status}`)
      // Only drop it locally once the server confirms
      setShowDeleteDialog(false)
      dispatch(deleteRecipie(recipieHere._id))
      toast(`Deleted "${recipieHere.name}"`)
    } catch {
      toast("Couldn't delete the recipe. Try again.", 'error')
    } finally {
      setDeleting(false)
    }
  }

if (modMode) {
    return (
      <ModifyRecipieForm recipie={recipieHere} conversions={conversions} setModMode={setModMode} setRecipie={setRecipie} />
    )
  }

      return (
      <>
        <div className={style['recipe-view']}>
          {recipieHere.image && (
            <Image width={0} height={0} sizes='100vw' src={`/api/uploads/${recipieHere.image}`} alt={recipieHere.image} className={style.image} />
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div>
              <p className={style['info-label']}>Servings</p>
              <p className={style['info-value']}>{recipieHere.servings * ingMultiplier}</p>
            </div>
            <div>
              <p className={style['info-label']}>Cal / serving</p>
              <p className={style['info-value']}>{recipieHere.cals}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Batch:</span>
              <Select onValueChange={(e) => setMultiplier(Number(e))}>
                <SelectTrigger className="w-[100px] h-9 text-sm">
                  <SelectValue placeholder="1×" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(multipliers).map((mult, index) => (
                    <SelectItem value={mult.toString()} key={index}>
                      {mult === .25 ? '¼×' : mult === .33 ? '⅓×' : mult === .5 ? '½×' : `${mult}×`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button className="action-btn" onClick={handleModify} aria-label="modify recipe">
                <PencilLine className="h-3.5 w-3.5" />
              </button>
              <button className="action-btn" style={{background: 'hsl(var(--destructive)/0.1)', color: 'hsl(var(--destructive))'}} onClick={handleDelete} aria-label="delete recipe">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <h2 className="section-label mt-5 mb-2">Ingredients</h2>
          <div className={style['ingredients-list']}>
            {recipieHere.ingredients.map((i) => (
              <div key={i.name} className={style['ingredient-item']}>
                <span className={style['ingredient-name']}>{i.name}</span>
                <span className={style['ingredient-amount']}>{i.value * ingMultiplier} {i.type}</span>
              </div>
            ))}
          </div>

          <h2 className="section-label mt-5 mb-2">Steps</h2>
          <div className={style['instructions-list']}>
            {recipieHere.instructions.map((i, j) => (
              <div key={j} className={style['instruction-item']}>
                <span className={style['instruction-number']}>{j + 1}</span>
                <p className={style['instruction-text']}>{i}</p>
              </div>
            ))}
          </div>
        </div>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recipe</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{recipieHere.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" className="form-cancel-btn" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>Cancel</Button>
               <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
}

export default ShowRecipie