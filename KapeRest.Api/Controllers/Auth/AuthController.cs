﻿using KapeRest.Application.DTOs.Auth;
using KapeRest.Application.DTOs.Jwt;
using KapeRest.Application.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace KapeRest.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AccountService _accountService;
        public AuthController(AccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("Login")]
        public async Task<ActionResult<CreateJwtTokenDTO>> Login([FromBody]LoginDTO login)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _accountService.Login(login);

            var tokenDTO = new CreateJwtTokenDTO
            {
                Token = result.Token,
                RefreshToken = result.RefreshToken
            };

            if (result is not null)
            {
                return Ok(tokenDTO);
            }
            return BadRequest("Invalid credentials");
        }


        [HttpPost("RefreshToken")]
        public async Task<ActionResult<JwtRefreshResponseDTO>> RefreshToken([FromBody]JwtRefreshRequestDTO refreshToken)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            var result = await _accountService.TokenRefresh(refreshToken);
            if (result is null)
                return Unauthorized(new { message = "Invalid or expired refresh token" });

            return Ok(result);
        }

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            await _accountService.Logout();
            return Ok("Logged out successfully.");
        }

        [HttpPost("ChangePassword")]
        public async Task<ActionResult>ChangePassword(ChangePassDTO pass)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);

            await _accountService.ChangePassword(pass);
            return Ok("Password changed successfully.");
        }


    }
}
