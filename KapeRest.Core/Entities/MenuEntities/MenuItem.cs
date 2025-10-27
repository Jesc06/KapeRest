﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KapeRest.Domain.Entities.MenuEntities
{
    public class MenuItem
    {
        public int Id { get; set; }
        public string ItemName { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public string IsAvailable { get; set; }   
        public byte[] Image { get; set; }
        public ICollection<MenuItemProduct> MenuItemProducts { get; set; }
        public MenuItem()
        {
            MenuItemProducts = new List<MenuItemProduct>();
        }
    }
}
