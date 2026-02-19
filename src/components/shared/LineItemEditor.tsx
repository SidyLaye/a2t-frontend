"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";

export interface LineItemValue {
  description: string;
  quantity: string;
  unit: string;
  unit_price_ht: string;
  vat_rate: string;
}

const VAT_RATES = [
  { label: "20%", value: "20.00" },
  { label: "10%", value: "10.00" },
  { label: "5,5%", value: "5.50" },
  { label: "2,1%", value: "2.10" },
  { label: "0%", value: "0.00" },
];

interface LineItemEditorProps {
  name: string;
}

export function LineItemEditor({ name }: LineItemEditorProps) {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  const lines = watch(name) as LineItemValue[];

  const calcLine = (line: LineItemValue) => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price_ht) || 0;
    const vatRate = parseFloat(line.vat_rate) || 0;
    const totalHt = qty * price;
    const totalVat = totalHt * (vatRate / 100);
    const totalTtc = totalHt + totalVat;
    return { totalHt, totalVat, totalTtc };
  };

  const grandTotals = (lines ?? []).reduce(
    (acc, line) => {
      const { totalHt, totalVat, totalTtc } = calcLine(line);
      return {
        totalHt: acc.totalHt + totalHt,
        totalVat: acc.totalVat + totalVat,
        totalTtc: acc.totalTtc + totalTtc,
      };
    },
    { totalHt: 0, totalVat: 0, totalTtc: 0 }
  );

  const addLine = () => {
    append({
      description: "",
      quantity: "1",
      unit: "unité",
      unit_price_ht: "",
      vat_rate: "20.00",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground uppercase tracking-wider px-1">
          <div className="col-span-4">Description</div>
          <div className="col-span-1">Qté</div>
          <div className="col-span-2">Unité</div>
          <div className="col-span-2">PU HT</div>
          <div className="col-span-1">TVA</div>
          <div className="col-span-1 text-right">Total TTC</div>
          <div className="col-span-1"></div>
        </div>

        {fields.map((field, index) => {
          const line = lines?.[index];
          const { totalTtc } = line ? calcLine(line) : { totalTtc: 0 };

          return (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              {/* Description */}
              <div className="col-span-4">
                <FormField
                  control={control}
                  name={`${name}.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Description de la prestation"
                          className="bg-background/50 border-border/60 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity */}
              <div className="col-span-1">
                <FormField
                  control={control}
                  name={`${name}.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="1"
                          className="bg-background/50 border-border/60 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit */}
              <div className="col-span-2">
                <FormField
                  control={control}
                  name={`${name}.${index}.unit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="unité"
                          className="bg-background/50 border-border/60 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit price HT */}
              <div className="col-span-2">
                <FormField
                  control={control}
                  name={`${name}.${index}.unit_price_ht`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          className="bg-background/50 border-border/60 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* VAT rate */}
              <div className="col-span-1">
                <FormField
                  control={control}
                  name={`${name}.${index}.vat_rate`}
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-border/60 text-sm h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VAT_RATES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total TTC (calculated) */}
              <div className="col-span-1 flex items-center justify-end">
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(totalTtc)}
                </span>
              </div>

              {/* Remove button */}
              <div className="col-span-1 flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-red-400"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLine}
        className="border-dashed border-border/60 hover:border-indigo-500/50 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter une ligne
      </Button>

      {/* Grand totals */}
      <div className="border-t border-border/50 pt-4 space-y-1">
        <div className="flex justify-end gap-8 text-sm text-muted-foreground">
          <span>Total HT</span>
          <span className="tabular-nums w-28 text-right font-medium text-foreground">
            {formatCurrency(grandTotals.totalHt)}
          </span>
        </div>
        <div className="flex justify-end gap-8 text-sm text-muted-foreground">
          <span>Total TVA</span>
          <span className="tabular-nums w-28 text-right font-medium text-foreground">
            {formatCurrency(grandTotals.totalVat)}
          </span>
        </div>
        <div className="flex justify-end gap-8 text-base font-semibold border-t border-border/50 pt-2 mt-2">
          <span>Total TTC</span>
          <span className="tabular-nums w-28 text-right text-indigo-400">
            {formatCurrency(grandTotals.totalTtc)}
          </span>
        </div>
      </div>
    </div>
  );
}
