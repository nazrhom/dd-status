# dd-status



## Usage

To install
```
npm install dd-status -g
```

Now you can run 
```
dd-node bs=1M if=input_file of=outupt_file
```
or whatever bs settings you fancy and get a progress bar for your copy.


This is only tested on OSX, different OS use different signals for dd so it will currently not work on platforms. Support for more is coming soon, any kind of contribution is appreciated.
