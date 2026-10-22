import {Schema, model, models} from 'mongoose';

// _id: false keeps ingredients as plain embedded objects, matching existing documents
const ingredientSchema = new Schema({
    name: { type: String, required: true },
    value: { type: Number, required: true },
    type: { type: String, required: true },
    convAvailable: { type: Boolean, required: false }
}, { _id: false })

const recipieSchema = new Schema({
    name: { type: String, required: true},
    ingredients: { type: [ingredientSchema], required: true },
    instructions: { type: [String], required: true },
    image: { type: String, required: false },
    servings: { type: Number, required: true },
    cals: { type: Number, required: true }
})

const Recipie = models.Recipie || model('Recipie', recipieSchema);

export default Recipie;
