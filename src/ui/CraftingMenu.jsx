import React from 'react';
import { useGameStore } from '../store';
import { craftingRecipes } from '../constants';

function canCraft(recipe, inventory) {
  for (const [item, amount] of Object.entries(recipe.inputs)) {
    if ((inventory[item] || 0) < amount) return false;
  }
  return true;
}

function inputLabel(inputs) {
  return Object.entries(inputs).map(([k, v]) => `${v} ${k}`).join(' + ');
}

function outputLabel(output) {
  return Object.entries(output).map(([k, v]) => `${v} ${k}`).join(' + ');
}

export default function CraftingMenu() {
  const craftingOpen = useGameStore(s => s.craftingOpen);
  const closeCrafting = useGameStore(s => s.closeCrafting);
  const craft = useGameStore(s => s.craft);
  const inventory = useGameStore(s => s.inventory);

  if (!craftingOpen) return null;

  return (
    <div id="crafting-overlay" onClick={(e) => {
      if (e.target.id === 'crafting-overlay') closeCrafting();
    }}>
      <div className="crafting-panel">
        <div className="crafting-header">
          <span>// COLONY HUB — CRAFTING</span>
          <span className="crafting-close" onClick={closeCrafting}>[ESC / E]</span>
        </div>
        <div className="crafting-list">
          {craftingRecipes.map(recipe => {
            const affordable = canCraft(recipe, inventory);
            return (
              <div
                key={recipe.id}
                className={`crafting-row${affordable ? '' : ' disabled'}`}
                onClick={() => affordable && craft(recipe.id)}
              >
                <div className="crafting-row-top">
                  <span className="crafting-name">{recipe.name}</span>
                  <span className="crafting-arrow">{'->'}</span>
                  <span className="crafting-output">{outputLabel(recipe.output)}</span>
                </div>
                <div className="crafting-row-bottom">
                  <span className="crafting-cost">{inputLabel(recipe.inputs)}</span>
                  <span className="crafting-desc">{recipe.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="crafting-inv">
          <div className="crafting-inv-header">// MATERIALS</div>
          <div className="crafting-inv-grid">
            {Object.entries(inventory).filter(([, c]) => c > 0).map(([item, count]) => (
              <div key={item} className="crafting-inv-item">
                <span>{item}</span>
                <span className="count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
