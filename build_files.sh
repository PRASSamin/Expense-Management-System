echo "BUILD START"

if ! command -v pip3 &> /dev/null; then
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py --user
    export PATH=$PATH:~/.local/bin
fi

python3 -m venv venv
source venv/bin/activate

python3 -m pip install -r requirements.txt

python3 manage.py collectstatic --noinput --clear
python3 manage.py makemigrations
python3 manage.py migrate


echo "BUILD END"
