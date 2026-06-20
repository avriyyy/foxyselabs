package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

// AES-256-GCM helpers. Key is base64-encoded 32 bytes from ENCRYPTION_KEY env.

type Cipher struct {
	gcm cipher.AEAD
}

func New(keyB64 string) (*Cipher, error) {
	key, err := base64.StdEncoding.DecodeString(keyB64)
	if err != nil {
		return nil, errors.New("encryption key must be base64")
	}
	if len(key) != 32 {
		return nil, errors.New("encryption key must decode to 32 bytes (AES-256)")
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return &Cipher{gcm: gcm}, nil
}

func (c *Cipher) Encrypt(plaintext []byte) ([]byte, error) {
	if plaintext == nil {
		return nil, nil
	}
	nonce := make([]byte, c.gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	ct := c.gcm.Seal(nonce, nonce, plaintext, nil)
	return ct, nil
}

func (c *Cipher) Decrypt(ciphertext []byte) ([]byte, error) {
	if ciphertext == nil {
		return nil, nil
	}
	ns := c.gcm.NonceSize()
	if len(ciphertext) < ns {
		return nil, errors.New("ciphertext too short")
	}
	nonce, ct := ciphertext[:ns], ciphertext[ns:]
	return c.gcm.Open(nil, nonce, ct, nil)
}

func (c *Cipher) EncryptString(s string) ([]byte, error) {
	return c.Encrypt([]byte(s))
}

func (c *Cipher) DecryptString(b []byte) (string, error) {
	out, err := c.Decrypt(b)
	if err != nil {
		return "", err
	}
	return string(out), nil
}
