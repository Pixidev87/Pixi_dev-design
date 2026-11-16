<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\NewAccessToken;

class AuthService
{
    /** @param array{name: string, email: string, password: string} $data */
    public function register(array $data): User
    {
        try {
            return DB::transaction(function () use ($data): User {
                $user = new User($data);
                $user->demo_uses_left = 5;
                $user->save();
                event(new Registered($user));

                return $user;
            });
        } catch (UniqueConstraintViolationException $exception) {
            if (User::where('email', $data['email'])->exists()) {
                throw ValidationException::withMessages(['email' => 'Ez az e-mail-cím már regisztrálva van.']);
            }

            throw $exception;
        }
    }

    /** @param array{email: string, password: string} $credentials */
    public function login(array $credentials): NewAccessToken
    {
        $user = User::where('email', $credentials['email'])->first();
        $passwordHash = $user?->password ?? config('auth.login_dummy_hash');
        $passwordMatches = Hash::check($credentials['password'], $passwordHash);

        if (! $user || ! $passwordMatches) {
            throw ValidationException::withMessages(['email' => 'Hibás e-mail-cím vagy jelszó.']);
        }

        if (Hash::needsRehash($user->password)) {
            $user->forceFill(['password' => $credentials['password']])->save();
        }

        return $user->createToken('pixi-api', ['*'], now()->addDay());
    }
}
