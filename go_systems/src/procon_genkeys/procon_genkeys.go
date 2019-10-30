package procon_genkeys

import (
    "crypto/rand"
    "crypto/rsa"
    "crypto/x509"
    "encoding/pem"
)

func PrivateKeyToEncryptedPEM(bits int, pwd string) ([]byte, error) {
    //Generate the key of length bits
    key, err := rsa.GenerateKey(rand.Reader, bits)
    if err != nil {
        return nil, err
    }

    // Convert it to pem
    block := &pem.Block{
        Type:  "RSA PRIVATE KEY",
        Bytes: x509.MarshalPKCS1PrivateKey(key),
    }

    //Encrypt the pem
    if pwd != "" {
        block, err = x509.EncryptPEMBlock(rand.Reader, block.Type, block.Bytes, []byte(pwd), x509.PEMCipherAES256)
        if err != nil {
            return nil, err
        }
    }
    return pem.EncodeToMemory(block), nil
}