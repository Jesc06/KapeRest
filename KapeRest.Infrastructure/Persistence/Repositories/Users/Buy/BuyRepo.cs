﻿using Azure.Core;
using KapeRest.Application.DTOs.Users.Buy;
using KapeRest.Application.Interfaces.Users.Buy;
using KapeRest.Core.Entities.SalesTransaction;
using KapeRest.Domain.Entities.MenuEntities;
using KapeRest.Infrastructures.Persistence.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KapeRest.Infrastructures.Persistence.Repositories.Users.Buy
{
    public class BuyRepo : IBuy
    {
        private readonly ApplicationDbContext _context;
        public BuyRepo(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> BuyMenuItemAsync(BuyMenuItemDTO buy)
        {
            //Get cashier info
            var cashier = await _context.UsersIdentity
                .FirstOrDefaultAsync(u => u.Id == buy.CashierId);

            if (cashier == null)
                return "Cashier not found";

            //Get menu item
            var menuItem = await _context.MenuItems
                .Include(m => m.MenuItemProducts)
                    .ThenInclude(mp => mp.ProductOfSupplier)
                .FirstOrDefaultAsync(m => m.Id == buy.MenuItemId);

            if (menuItem == null)
                return "Menu item not found";

            //Deduct stock
            foreach (var itemProduct in menuItem.MenuItemProducts)
            {
                var product = itemProduct.ProductOfSupplier;
                var totalToDeduct = itemProduct.QuantityUsed * buy.Quantity;

                if (product.Stocks < totalToDeduct)
                    return $"Not enough stock for {product.ProductName}";

                product.Stocks -= totalToDeduct;
            }

            //Compute totals
            decimal subtotal = menuItem.Price * buy.Quantity;

            // Convert the raw percent values into decimals
            decimal taxRate = buy.Tax / 100m;
            decimal discountRate = buy.DiscountPercent / 100m;

            decimal tax = subtotal * taxRate;
            decimal discount = subtotal * discountRate;
            decimal total = subtotal + tax - discount;

            //Save to SalesTransaction (linked to cashier + branch)
            var sale = new SalesTransactionEntities
            {
                CashierId = cashier.Id,
                BranchId = cashier.BranchId ?? 0,
                Subtotal = subtotal,
                Tax = tax,
                Discount = discount,
                Total = total,
                PaymentMethod = buy.PaymentMethod ?? "Cash",
                Status = "Completed",
            };

            _context.SalesTransaction.Add(sale);
            await _context.SaveChangesAsync();

            return $"Purchase successful (Receipt #{sale.ReceiptNumber})\nSubtotal:{subtotal}\nTax:{tax}\nDiscount:{discount}\nTotal:{total}";
        }

        
        public async Task<string> HoldTransaction(BuyMenuItemDTO buy) {
            var cashier = await _context.UsersIdentity
                    .FirstOrDefaultAsync(u => u.Id == buy.CashierId);

            if (cashier == null)
                return "Cashier not found";

            var menuItem = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == buy.MenuItemId);
            if (menuItem == null)
                return "Menu item not found";

            var subtotal = menuItem.Price * buy.Quantity;
            var tax = subtotal * (buy.Tax / 100m);
            var discount = subtotal * (buy.DiscountPercent / 100m);
            var total = subtotal + tax - discount;

            var transaction = new SalesTransactionEntities
            {
                CashierId = cashier.Id,
                BranchId = cashier.BranchId ?? 0,
                Subtotal = subtotal,
                Tax = tax,
                Discount = discount,
                Total = total,
                PaymentMethod = buy.PaymentMethod ?? "Cash",
                Status = "Hold"
            };

            _context.SalesTransaction.Add(transaction);
            await _context.SaveChangesAsync();

            // Save item details
            var saleItem = new SalesItemEntities
            {
                SalesTransactionId = transaction.Id,
                MenuItemId = menuItem.Id,
                Quantity = buy.Quantity,
                UnitPrice = menuItem.Price
            };
            _context.SalesItems.Add(saleItem);
            await _context.SaveChangesAsync();

            return $"Transaction held (Hold #{transaction.Id})";
        }

        public async Task<string> ResumeHoldAsync(int saleId)
        {
            var sale = await _context.SalesTransaction
             .FirstOrDefaultAsync(s => s.Id == saleId);

            if (sale == null) return "Hold not found";
            if (sale.Status != "Hold") return "Already finalized";

            var saleItems = await _context.SalesItems
                .Where(i => i.SalesTransactionId == sale.Id)
                .Include(i => i.MenuItem)
                    .ThenInclude(m => m.MenuItemProducts)
                    .ThenInclude(mp => mp.ProductOfSupplier)
                .ToListAsync();

            // Deduct stocks now that payment is confirmed
            foreach (var item in saleItems)
            {
                foreach (var prod in item.MenuItem.MenuItemProducts)
                {
                    var totalToDeduct = prod.QuantityUsed * item.Quantity;
                    if (prod.ProductOfSupplier.Stocks < totalToDeduct)
                        return $"Not enough stock for {prod.ProductOfSupplier.ProductName}";
                    prod.ProductOfSupplier.Stocks -= totalToDeduct;
                }
            }

            sale.Status = "Completed";
            await _context.SaveChangesAsync();

            return $"Hold transaction #{sale.Id} finalized successfully.";
        }


        public async Task<string> CancelHoldAsync(int saleId)
        {
            var sale = await _context.SalesTransaction.FirstOrDefaultAsync(s => s.Id == saleId);
            if (sale == null) return "Hold not found";

            sale.Status = "Canceled";
            await _context.SaveChangesAsync();

            return $"Hold transaction #{sale.Id} canceled.";
        }



    }
}
