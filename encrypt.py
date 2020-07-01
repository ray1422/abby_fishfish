import base64
import blowfish
from os import urandom
import os
import glob
import cv2
import json
from multiprocessing import Pool
from tqdm import tqdm


DIR = "./album"
OUTPUT_DIR = "album_encrypted"
key = input("Enter Password: ").encode("utf-8")


def process_encrypt(input_file, output_file, key):
    try:
        FILE = input_file
        cipher = blowfish.Cipher(key)
        iv = b"wwwwwwww"  # urandom(8)  # initialization vector

        with open(FILE, "rb") as f:
            encoded_string = base64.b64encode(f.read()).decode("utf-8")
        for i in range(len(encoded_string) % 8):
            encoded_string += "="

        data_encrypted = b"".join(cipher.encrypt_cbc(
            encoded_string.encode('utf-8'), iv))

        # data_decrypted = b"".join(cipher.decrypt_cbc(data_encrypted, iv))
        result = base64.b64encode(data_encrypted).decode("utf-8")

        with open(f"{OUTPUT_DIR}/{output_file}", "w") as f:
            f.write(result)
    except Exception as e:
        print(e)


try:
    with open(f"{OUTPUT_DIR}/index.json") as f:
        images = json.load(f)
except Exception:
    images = []


for dirname in glob.glob(f"{DIR}/*"):
    for filename in glob.glob(f"{dirname}/*.jpg"):
        output = f"{os.path.basename(dirname)}_{os.path.basename(filename).replace('.jpg','.img')}"
        images.append(output)
        process_encrypt(filename, output, key)
        print(output)
        # p.apply_async(process_encrypt, args=(filename, output, key)).get()

images = list(set(images))

with open(f"{OUTPUT_DIR}/index.json", "w") as f:
    json.dump(images, f)
