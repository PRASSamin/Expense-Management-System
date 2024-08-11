echo "BUILD START"

apt-get update
apt-get install -y libmysqlclient-dev

if ! command -v pip3 &> /dev/null; then
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py --user
    export PATH=$PATH:~/.local/bin
fi

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python manage.py collectstatic --noinput --clear
python manage.py makemigrations
python manage.py migrate

echo "BUILD END"
