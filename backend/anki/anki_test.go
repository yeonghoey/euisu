package anki

import (
	"io/ioutil"
	"testing"
)

func TestNewAnkiFailsIfNotExist(t *testing.T) {
	path := "/path/not/exist"
	_, err := NewAnki(path)
	if err == nil {
		t.Errorf("NewAnki should fail when %q doesn't exist", path)
	}
}

func TestNewAnkiFailsIfNotDir(t *testing.T) {
	f, err := ioutil.TempFile("", "")
	if err != nil {
		t.Error(err)
	}
	defer f.Close()

	path := f.Name()
	_, err = NewAnki(path)
	if err == nil {
		t.Errorf("NewAnki should fail when %q is not a directory", path)
	}
}
