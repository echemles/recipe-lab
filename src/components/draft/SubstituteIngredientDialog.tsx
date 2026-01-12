"use client";

import { useEffect, useRef, useState } from "react";
import { Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/Modal";

interface SubstituteIngredientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubstitute: (newIngredient: Ingredient) => void;
  originalIngredient: Ingredient;
}

const COMMON_SUBSTITUTES = [
  "rice", "quinoa", "couscous", "pasta", "bread", "potatoes", "sweet potatoes",
  "chicken", "beef", "pork", "tofu", "tempeh", "lentils", "beans", "chickpeas",
  "onions", "garlic", "carrots", "celery", "bell peppers", "mushrooms", "tomatoes",
  "spinach", "kale", "lettuce", "broccoli", "cauliflower", "zucchini", "eggplant",
  "milk", "cream", "yogurt", "cheese", "butter", "olive oil", "vegetable oil",
  "flour", "sugar", "honey", "maple syrup", "vanilla", "cocoa", "chocolate",
];

export function SubstituteIngredientDialog({
  isOpen,
  onClose,
  onSubstitute,
  originalIngredient,
}: SubstituteIngredientDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [quantity, setQuantity] = useState(originalIngredient.quantity);
  const [unit, setUnit] = useState(originalIngredient.unit);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = COMMON_SUBSTITUTES.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (name: string) => {
    setSelectedName(name);
    setSearchTerm(name);
  };

  const handleSubmit = () => {
    if (!selectedName.trim()) return;
    
    const newIngredient: Ingredient = {
      name: selectedName.trim(),
      quantity: quantity || 0,
      unit: unit || "",
    };
    
    onSubstitute(newIngredient);
    onClose();
    // Reset form
    setSearchTerm("");
    setSelectedName("");
    setQuantity(originalIngredient.quantity);
    setUnit(originalIngredient.unit);
  };

  const handleCancel = () => {
    onClose();
    // Reset form
    setSearchTerm("");
    setSelectedName("");
    setQuantity(originalIngredient.quantity);
    setUnit(originalIngredient.unit);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      disableBackdropClose
      size="md"
      ariaLabel="Substitute Ingredient"
      ariaDescribedBy="substitute-description"
    >
      <ModalHeader>
        <ModalTitle>Substitute Ingredient</ModalTitle>
        <ModalDescription id="substitute-description">
          Replace &quot;{originalIngredient.name}&quot; with a different ingredient.
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        <div>
          <label className="text-xs text-muted block mb-2">
            Search or enter ingredient name
          </label>
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedName(e.target.value);
            }}
            placeholder="e.g., quinoa, tofu, olive oil"
            className="w-full"
          />
        </div>

        {searchTerm && filteredOptions.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-2">Common options:</p>
            <div className="max-h-32 overflow-y-auto border border-border/50 rounded-lg bg-surface-1">
              {filteredOptions.slice(0, 6).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-surface-2 focus:bg-surface-2 focus:outline-none first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">
              Quantity (optional)
            </label>
            <Input
              type="number"
              step="any"
              value={quantity || ""}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">
              Unit (optional)
            </label>
            <Input
              type="text"
              value={unit || ""}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="cup, tbsp, etc."
              className="text-sm"
            />
          </div>
        </div>

        <div className="bg-surface-2/50 rounded-lg p-3 border border-border/30">
          <p className="text-xs text-muted mb-1">Preview:</p>
          <p className="text-sm font-medium">
            {quantity ? `${quantity} ` : ""}
            {unit ? `${unit} ` : ""}
            {selectedName || "Enter ingredient name"}
          </p>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedName.trim()}
        >
          Substitute
        </Button>
      </ModalFooter>
    </Modal>
  );
}
