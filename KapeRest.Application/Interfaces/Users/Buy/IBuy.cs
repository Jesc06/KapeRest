﻿using KapeRest.Application.DTOs.Users.Buy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KapeRest.Application.Interfaces.Users.Buy
{
    public interface IBuy
    {
        Task<string> BuyMenuItemAsync(BuyMenuItemDTO buy);
        Task<string> HoldTransaction(BuyMenuItemDTO buy);
        Task<string> ResumeHoldAsync(int saleId);
        Task<string> CancelHoldAsync(int saleId);
    }
}
